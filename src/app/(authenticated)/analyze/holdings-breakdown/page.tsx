"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, Loader2, Search } from "lucide-react";
import { generateClient } from "aws-amplify/data";

const client = generateClient<any>();

interface PortfolioHolding {
  ticker: string;
  shares: number;
  currentValue: number;
  costBasis: number;
  tickerType?: string;
}

interface UnderlyingHolding {
  ticker: string;
  weight: number; // percentage weight in the fund (0-100)
  name?: string;
}

interface EffectiveHolding {
  ticker: string;
  effectiveValue: number;
  percentage: number;
  sources: { parentTicker: string; contribution: number }[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function HoldingsBreakdownPage() {
  const [effectiveHoldings, setEffectiveHoldings] = useState<EffectiveHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalValue, setTotalValue] = useState(0);
  const [fundBreakdowns, setFundBreakdowns] = useState<
    { ticker: string; type: string; value: number; underlyingCount: number }[]
  >([]);

  useEffect(() => {
    calculateBreakdown();
  }, []);

  async function fetchTickerHoldings(ticker: string): Promise<UnderlyingHolding[]> {
    try {
      const response: any = await client.queries.getTickerHoldings({
        ticker: ticker.toUpperCase(),
      });

      console.log(`getTickerHoldings(${ticker}):`, JSON.stringify(response?.data));

      if (response?.data?.found && response.data.holdings) {
        return response.data.holdings
          .map((h: any) => ({
            ticker: h.ticker || "",
            weight: h.weight || 0,
            name: h.name || "",
          }))
          .filter((h: UnderlyingHolding) => h.ticker && h.weight > 0);
      }
    } catch (err) {
      console.error(`Error fetching underlying holdings for ${ticker}:`, err);
    }

    return [];
  }

  async function calculateBreakdown() {
    try {
      setLoading(true);

      // 1. Get user's portfolio
      const response: any = await client.models.ExtractedHolding.list({});
      const holdings: PortfolioHolding[] = (response.data || [])
        .filter((h: any) => h.ticker)
        .map((h: any) => ({
          ticker: (h.ticker || "").toUpperCase(),
          shares: h.shares ?? 0,
          currentValue: h.currentValue ?? h.costBasis ?? 0,
          costBasis: h.costBasis ?? 0,
          tickerType: h.tickerType || "",
        }));

      // Consolidate by ticker
      const consolidated = new Map<string, PortfolioHolding>();
      for (const h of holdings) {
        if (consolidated.has(h.ticker)) {
          const existing = consolidated.get(h.ticker)!;
          const newShares = existing.shares + h.shares;
          const totalExValue = existing.currentValue * existing.shares + h.currentValue * h.shares;
          existing.shares = newShares;
          existing.currentValue = totalExValue / newShares;
          existing.tickerType = existing.tickerType || h.tickerType;
        } else {
          consolidated.set(h.ticker, { ...h });
        }
      }

      const portfolioHoldings = Array.from(consolidated.values());
      const total = portfolioHoldings.reduce(
        (sum, h) => sum + h.currentValue * h.shares,
        0
      );
      setTotalValue(total);

      // 2. For each ETF/MutualFund, get underlying holdings
      const effectiveMap = new Map<
        string,
        { value: number; sources: { parentTicker: string; contribution: number }[] }
      >();

      const fundInfo: { ticker: string; type: string; value: number; underlyingCount: number }[] = [];

      for (const holding of portfolioHoldings) {
        const holdingValue = holding.currentValue * holding.shares;
        const isFund =
          holding.tickerType === "ETF" || holding.tickerType === "MutualFund";

        if (isFund) {
          // Try to get underlying holdings
          const underlyings = await fetchTickerHoldings(holding.ticker);

          if (underlyings.length > 0) {
            fundInfo.push({
              ticker: holding.ticker,
              type: holding.tickerType || "ETF",
              value: holdingValue,
              underlyingCount: underlyings.length,
            });

            // Distribute fund value across underlying holdings by weight
            for (const u of underlyings) {
              const contribution = holdingValue * (u.weight / 100);
              const upperTicker = u.ticker.toUpperCase();

              if (effectiveMap.has(upperTicker)) {
                const entry = effectiveMap.get(upperTicker)!;
                entry.value += contribution;
                entry.sources.push({ parentTicker: holding.ticker, contribution });
              } else {
                effectiveMap.set(upperTicker, {
                  value: contribution,
                  sources: [{ parentTicker: holding.ticker, contribution }],
                });
              }
            }
          } else {
            // No underlying data available — treat as a single holding
            fundInfo.push({
              ticker: holding.ticker,
              type: holding.tickerType || "ETF",
              value: holdingValue,
              underlyingCount: 0,
            });

            if (effectiveMap.has(holding.ticker)) {
              const entry = effectiveMap.get(holding.ticker)!;
              entry.value += holdingValue;
              entry.sources.push({ parentTicker: "Direct", contribution: holdingValue });
            } else {
              effectiveMap.set(holding.ticker, {
                value: holdingValue,
                sources: [{ parentTicker: "Direct", contribution: holdingValue }],
              });
            }
          }
        } else {
          // Individual stock or cash — add directly
          if (effectiveMap.has(holding.ticker)) {
            const entry = effectiveMap.get(holding.ticker)!;
            entry.value += holdingValue;
            entry.sources.push({ parentTicker: "Direct", contribution: holdingValue });
          } else {
            effectiveMap.set(holding.ticker, {
              value: holdingValue,
              sources: [{ parentTicker: "Direct", contribution: holdingValue }],
            });
          }
        }
      }

      // 3. Convert to sorted array
      const effective: EffectiveHolding[] = Array.from(effectiveMap.entries())
        .map(([ticker, data]) => ({
          ticker,
          effectiveValue: data.value,
          percentage: total > 0 ? (data.value / total) * 100 : 0,
          sources: data.sources,
        }))
        .sort((a, b) => b.effectiveValue - a.effectiveValue);

      setEffectiveHoldings(effective);
      setFundBreakdowns(fundInfo);
    } catch (err) {
      console.error("Error calculating breakdown:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredHoldings = effectiveHoldings.filter((h) =>
    h.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/analyze"
        className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Analysis
      </Link>

      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Holdings Breakdown
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Effective stock exposure including underlying holdings of ETFs and funds
        </p>
      </div>

      {/* Fund summary */}
      {fundBreakdowns.length > 0 && (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--color-text)] mb-3">
            Fund Decomposition
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {fundBreakdowns.map((f) => (
              <div
                key={f.ticker}
                className="border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg-secondary)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--color-text)]">
                    {f.ticker}
                  </span>
                  <span className="text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded">
                    {f.type}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {formatCurrency(f.value)}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {f.underlyingCount > 0
                    ? `${f.underlyingCount} underlying holdings`
                    : "No underlying data available"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      {effectiveHoldings.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search by ticker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
          />
        </div>
      )}

      {/* Effective holdings table */}
      {effectiveHoldings.length === 0 ? (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <Layers className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">
            No holdings found. Import your portfolio to see the breakdown.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {filteredHoldings.length} effective positions · Total:{" "}
              {formatCurrency(totalValue)}
            </p>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {filteredHoldings.slice(0, 50).map((holding) => (
              <div
                key={holding.ticker}
                className="px-6 py-4 flex items-center gap-4"
              >
                {/* Bar indicator */}
                <div className="w-1 h-10 rounded-full bg-[var(--color-primary)]" style={{
                  opacity: Math.max(0.2, holding.percentage / 100 * 3),
                }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[var(--color-text)]">
                      {holding.ticker}
                    </p>
                    <p className="font-medium text-[var(--color-text)]">
                      {formatCurrency(holding.effectiveValue)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      {holding.sources.map((s, i) => (
                        <span
                          key={i}
                          className="text-xs text-[var(--color-text-muted)]"
                        >
                          {s.parentTicker !== "Direct"
                            ? `via ${s.parentTicker}`
                            : "Direct"}
                          {i < holding.sources.length - 1 ? " · " : ""}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {holding.percentage.toFixed(2)}%
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="w-full h-1 bg-[var(--color-bg-tertiary)] rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-primary)]"
                      style={{ width: `${Math.min(holding.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredHoldings.length > 50 && (
            <div className="px-6 py-3 text-center text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
              Showing top 50 of {filteredHoldings.length} positions
            </div>
          )}
        </div>
      )}
    </div>
  );
}

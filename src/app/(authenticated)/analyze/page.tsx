"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PieChart,
  Activity,
  Globe,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react";
import { generateClient } from "aws-amplify/data";

const client = generateClient<any>();

const analysisCards = [
  {
    title: "Sector Breakdown",
    description: "View allocation across technology, healthcare, financials, and more",
    icon: PieChart,
    href: "#sector-breakdown",
    color: "text-[var(--color-primary)]",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    action: "toggleSector",
  },
  {
    title: "Performance",
    description: "Track returns vs S&P 500 and sector benchmarks over time",
    icon: TrendingUp,
    href: "/analyze/performance",
    color: "text-[var(--color-success)]",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "Risk Assessment",
    description: "Portfolio beta, volatility, concentration risk analysis",
    icon: AlertTriangle,
    href: "/analyze/risk",
    color: "text-[var(--color-warning)]",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    title: "Holdings Breakdown",
    description: "See effective stock exposure including underlying holdings of ETFs and funds",
    icon: Globe,
    href: "/analyze/holdings-breakdown",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    title: "Dividend Analysis",
    description: "Yield on cost, income projections, payout history",
    icon: BarChart3,
    href: "/analyze/performance",
    color: "text-teal-500",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
  },
  {
    title: "Correlation Matrix",
    description: "How your holdings move relative to each other",
    icon: Activity,
    href: "/analyze/risk",
    color: "text-rose-500",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
  },
];

interface HealthMetric {
  label: string;
  score: number;
  status: string;
  detail?: string;
}

interface SectorItem {
  sector: string;
  value: number;
  percentage: number;
  tickers: string[];
}

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3b82f6",
  Healthcare: "#10b981",
  Financials: "#f59e0b",
  Energy: "#ef4444",
  Industrials: "#6366f1",
  "Consumer Discretionary": "#8b5cf6",
  "Consumer Staples": "#14b8a6",
  "Communication Services": "#ec4899",
  Utilities: "#84cc16",
  "Real Estate": "#f97316",
  Materials: "#a855f7",
  Cash: "#94a3b8",
  Other: "#6b7280",
};

export default function AnalyzePage() {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [dividendYield, setDividendYield] = useState<number>(0);
  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [showSectorBreakdown, setShowSectorBreakdown] = useState(false);

  useEffect(() => {
    calculateHealth();
  }, []);

  async function calculateHealth() {
    try {
      setLoading(true);

      // Fetch portfolio holdings
      const response: any = await client.models.ExtractedHolding.list({});
      const holdings = (response.data || []).filter((h: any) => h.ticker);

      if (holdings.length === 0) {
        setHealthMetrics([
          { label: "Diversification", score: 0, status: "No data" },
          { label: "Risk Level", score: 0, status: "No data" },
          { label: "Dividend Yield", score: 0, status: "No data" },
          { label: "Growth Potential", score: 0, status: "No data" },
        ]);
        setLoading(false);
        return;
      }

      // Consolidate by ticker
      const consolidated = new Map<string, { ticker: string; value: number; tickerType: string }>();
      let totalValue = 0;

      for (const h of holdings) {
        const ticker = (h.ticker || "").toUpperCase();
        const value = (h.currentValue ?? h.costBasis ?? 0) * (h.shares ?? 0);
        totalValue += value;

        if (consolidated.has(ticker)) {
          consolidated.get(ticker)!.value += value;
        } else {
          consolidated.set(ticker, { ticker, value, tickerType: h.tickerType || "" });
        }
      }

      const uniqueHoldings = Array.from(consolidated.values());
      setPortfolioValue(totalValue);

      // 1. Diversification score (based on number of holdings and concentration)
      const topHoldingPct = uniqueHoldings.length > 0
        ? (uniqueHoldings.sort((a, b) => b.value - a.value)[0].value / totalValue) * 100
        : 100;
      const diversificationScore = Math.min(
        100,
        Math.round(
          (Math.min(uniqueHoldings.length, 20) / 20) * 50 + // up to 50 points for count
          (1 - topHoldingPct / 100) * 50 // up to 50 points for low concentration
        )
      );

      // 2. Risk level (higher concentration = higher risk)
      const top3Pct = uniqueHoldings
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .reduce((sum, h) => sum + h.value, 0) / totalValue * 100;
      const riskScore = Math.round(100 - top3Pct); // Lower top3 concentration = lower risk (higher score)

      // 3. Fetch ticker data (dividend yield + sector) in parallel
      let weightedDividendYield = 0;
      let tickersWithYield = 0;

      const tickersToFetch = uniqueHoldings.filter((h) => h.ticker !== "CASH");
      const tickerResults = await Promise.all(
        tickersToFetch.map(async (holding) => {
          try {
            const res: any = await client.queries.getTickerHoldings({ ticker: holding.ticker });
            return {
              ticker: holding.ticker,
              dividendYield: res?.data?.dividendYield,
              sector: res?.data?.sector || null,
              weight: holding.value / totalValue,
              value: holding.value,
            };
          } catch {
            return {
              ticker: holding.ticker,
              dividendYield: null,
              sector: null,
              weight: holding.value / totalValue,
              value: holding.value,
            };
          }
        })
      );

      // Calculate weighted dividend yield
      for (const result of tickerResults) {
        const dy = typeof result.dividendYield === "number"
          ? result.dividendYield
          : parseFloat(String(result.dividendYield || "0"));

        if (!isNaN(dy) && dy > 0) {
          weightedDividendYield += dy * result.weight;
          tickersWithYield++;
        }
      }

      console.log(`Total weighted dividend yield: ${weightedDividendYield.toFixed(4)}%, tickers with data: ${tickersWithYield}`);

      // Calculate sector breakdown
      const sectorMap = new Map<string, { value: number; tickers: string[] }>();
      for (const result of tickerResults) {
        const sector = result.sector || "Other";
        if (sectorMap.has(sector)) {
          const entry = sectorMap.get(sector)!;
          entry.value += result.value;
          entry.tickers.push(result.ticker);
        } else {
          sectorMap.set(sector, { value: result.value, tickers: [result.ticker] });
        }
      }
      // Add CASH if present
      const cashHolding = uniqueHoldings.find((h) => h.ticker === "CASH");
      if (cashHolding) {
        sectorMap.set("Cash", { value: cashHolding.value, tickers: ["CASH"] });
      }

      const sectorBreakdown = Array.from(sectorMap.entries())
        .map(([sector, data]) => ({
          sector,
          value: data.value,
          percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
          tickers: data.tickers,
        }))
        .sort((a, b) => b.value - a.value);

      setSectors(sectorBreakdown);
      setDividendYield(weightedDividendYield);

      setDividendYield(weightedDividendYield);

      // Score dividend yield: 0% = 0, 2% = 50, 4%+ = 100
      const dividendScore = Math.min(100, Math.round((weightedDividendYield / 4) * 100));

      // 4. Growth potential (ETF/stock mix — more stocks = more growth potential)
      const stockValue = uniqueHoldings
        .filter((h) => h.tickerType === "Stock")
        .reduce((sum, h) => sum + h.value, 0);
      const growthScore = Math.min(100, Math.round((stockValue / totalValue) * 100));

      setHealthMetrics([
        {
          label: "Diversification",
          score: diversificationScore,
          status: diversificationScore >= 70 ? "Good" : diversificationScore >= 40 ? "Moderate" : "Low",
          detail: `${uniqueHoldings.length} holdings, top position ${topHoldingPct.toFixed(0)}%`,
        },
        {
          label: "Risk Level",
          score: riskScore,
          status: riskScore >= 70 ? "Low Risk" : riskScore >= 40 ? "Moderate" : "High Risk",
          detail: `Top 3 = ${top3Pct.toFixed(0)}% of portfolio`,
        },
        {
          label: "Dividend Yield",
          score: dividendScore,
          status: weightedDividendYield >= 3 ? "Strong" : weightedDividendYield >= 1.5 ? "Moderate" : "Low",
          detail: `${weightedDividendYield.toFixed(2)}% weighted avg (${tickersWithYield} tickers)`,
        },
        {
          label: "Growth Potential",
          score: growthScore,
          status: growthScore >= 70 ? "Strong" : growthScore >= 40 ? "Moderate" : "Low",
          detail: `${((stockValue / totalValue) * 100).toFixed(0)}% in individual stocks`,
        },
      ]);
    } catch (err) {
      console.error("Error calculating health:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Portfolio Health Score */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          Portfolio Health
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
            <span className="ml-2 text-sm text-[var(--color-text-muted)]">
              Analyzing portfolio...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthMetrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {metric.label}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {metric.score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${metric.score}%`,
                      backgroundColor:
                        metric.score >= 70
                          ? "var(--color-success)"
                          : metric.score >= 40
                          ? "var(--color-warning)"
                          : "var(--color-danger)",
                    }}
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {metric.status}
                </p>
                {metric.detail && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {metric.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dividend Yield Summary */}
      {!loading && dividendYield > 0 && (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Weighted Average Dividend Yield
              </p>
              <p className="text-2xl font-bold text-[var(--color-text)] mt-1">
                {dividendYield.toFixed(2)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Est. Annual Income
              </p>
              <p className="text-2xl font-bold text-[var(--color-success)] mt-1">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                  portfolioValue * (dividendYield / 100)
                )}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                ~{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                  (portfolioValue * (dividendYield / 100)) / 12
                )}/month
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sector Breakdown */}
      {!loading && showSectorBreakdown && sectors.length > 0 && (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            Sector Breakdown
          </h2>
          {/* Stacked bar */}
          <div className="h-6 rounded-full overflow-hidden flex mb-4">
            {sectors.map((s) => (
              <div
                key={s.sector}
                style={{
                  width: `${s.percentage}%`,
                  backgroundColor: SECTOR_COLORS[s.sector] || SECTOR_COLORS["Other"],
                }}
                className="h-full transition-all hover:opacity-80"
                title={`${s.sector}: ${s.percentage.toFixed(1)}%`}
              />
            ))}
          </div>
          {/* Detail rows */}
          <div className="space-y-2">
            {sectors.map((s) => (
              <div key={s.sector} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: SECTOR_COLORS[s.sector] || SECTOR_COLORS["Other"] }}
                />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-[var(--color-text)]">
                      {s.sector}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] ml-2">
                      {s.tickers.join(", ")}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {s.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Sections */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          Analysis Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysisCards.map((card) =>
            (card as any).action === "toggleSector" ? (
              <button
                key={card.title}
                onClick={() => setShowSectorBreakdown(!showSectorBreakdown)}
                className={`text-left bg-[var(--color-bg)] border rounded-xl p-6 hover:border-[var(--color-primary)] hover:shadow-md transition-all group ${
                  showSectorBreakdown ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20" : "border-[var(--color-border)]"
                }`}
              >
                <div
                  className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center mb-4`}
                >
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <h3 className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {card.description}
                </p>
              </button>
            ) : (
              <Link
                key={card.title}
                href={card.href}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 hover:border-[var(--color-primary)] hover:shadow-md transition-all group"
              >
                <div
                  className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center mb-4`}
                >
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <h3 className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {card.description}
                </p>
              </Link>
            )
          )}
        </div>
      </div>

      {/* AI Insights Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="font-medium text-[var(--color-text)] mb-2">
              AI Insights
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Use the AI chat to ask about your portfolio composition, get
              personalized recommendations, or understand risk factors.
            </p>
            <Link
              href="/ai-chat"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Ask AI for details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

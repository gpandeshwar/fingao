"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PieChart, Loader2 } from "lucide-react";
import { generateClient } from "aws-amplify/data";

const client = generateClient<any>();

// Known sector mappings for common tickers
const SECTOR_MAP: Record<string, string> = {
  // Technology
  AAPL: "Technology",
  MSFT: "Technology",
  GOOGL: "Technology",
  GOOG: "Technology",
  META: "Technology",
  NVDA: "Technology",
  AMD: "Technology",
  INTC: "Technology",
  CRM: "Technology",
  ADBE: "Technology",
  ORCL: "Technology",
  CSCO: "Technology",
  AVGO: "Technology",
  TXN: "Technology",
  QCOM: "Technology",
  // Consumer
  AMZN: "Consumer Discretionary",
  TSLA: "Consumer Discretionary",
  HD: "Consumer Discretionary",
  NKE: "Consumer Discretionary",
  SBUX: "Consumer Discretionary",
  MCD: "Consumer Discretionary",
  // Healthcare
  JNJ: "Healthcare",
  UNH: "Healthcare",
  PFE: "Healthcare",
  ABBV: "Healthcare",
  MRK: "Healthcare",
  LLY: "Healthcare",
  TMO: "Healthcare",
  // Financials
  JPM: "Financials",
  BAC: "Financials",
  GS: "Financials",
  MS: "Financials",
  WFC: "Financials",
  V: "Financials",
  MA: "Financials",
  BRK: "Financials",
  // Energy
  XOM: "Energy",
  CVX: "Energy",
  COP: "Energy",
  // Industrials
  CAT: "Industrials",
  BA: "Industrials",
  HON: "Industrials",
  UPS: "Industrials",
  GE: "Industrials",
  // Communication
  DIS: "Communication Services",
  NFLX: "Communication Services",
  CMCSA: "Communication Services",
  T: "Communication Services",
  VZ: "Communication Services",
  // Consumer Staples
  PG: "Consumer Staples",
  KO: "Consumer Staples",
  PEP: "Consumer Staples",
  WMT: "Consumer Staples",
  COST: "Consumer Staples",
  // Utilities
  NEE: "Utilities",
  DUK: "Utilities",
  SO: "Utilities",
  // Real Estate
  AMT: "Real Estate",
  PLD: "Real Estate",
  O: "Real Estate",
  // Materials
  LIN: "Materials",
  APD: "Materials",
  // ETFs - Broad Market
  VTI: "Broad Market ETF",
  VOO: "Broad Market ETF",
  SPY: "Broad Market ETF",
  IVV: "Broad Market ETF",
  QQQ: "Technology ETF",
  // ETFs - Sector
  XLK: "Technology ETF",
  XLF: "Financials ETF",
  XLV: "Healthcare ETF",
  XLE: "Energy ETF",
  SCHD: "Dividend ETF",
  VYM: "Dividend ETF",
  // International
  VXUS: "International",
  EFA: "International",
  VEA: "International",
  VWO: "Emerging Markets",
  // Bonds
  BND: "Bonds",
  AGG: "Bonds",
  TLT: "Bonds",
  // Cash
  CASH: "Cash",
};

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3b82f6",
  "Consumer Discretionary": "#8b5cf6",
  Healthcare: "#10b981",
  Financials: "#f59e0b",
  Energy: "#ef4444",
  Industrials: "#6366f1",
  "Communication Services": "#ec4899",
  "Consumer Staples": "#14b8a6",
  Utilities: "#84cc16",
  "Real Estate": "#f97316",
  Materials: "#a855f7",
  "Broad Market ETF": "#0ea5e9",
  "Technology ETF": "#2563eb",
  "Financials ETF": "#d97706",
  "Healthcare ETF": "#059669",
  "Energy ETF": "#dc2626",
  "Dividend ETF": "#16a34a",
  International: "#7c3aed",
  "Emerging Markets": "#db2777",
  Bonds: "#64748b",
  Cash: "#94a3b8",
  Other: "#6b7280",
};

interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  holdings: { ticker: string; value: number }[];
  color: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function SectorsPage() {
  const [sectors, setSectors] = useState<SectorAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    fetchAndCalculateSectors();
  }, []);

  async function fetchAndCalculateSectors() {
    try {
      setLoading(true);
      const response: any = await client.models.ExtractedHolding.list({});
      const holdings = (response.data || []).filter((h: any) => h.ticker);

      // Calculate total portfolio value
      const total = holdings.reduce(
        (sum: number, h: any) => sum + (h.currentValue ?? h.costBasis ?? 0) * (h.shares ?? 0),
        0
      );
      setTotalValue(total);

      // Group by sector
      const sectorMap = new Map<string, { value: number; holdings: { ticker: string; value: number }[] }>();

      for (const h of holdings) {
        const ticker = (h.ticker || "").toUpperCase();
        const value = (h.currentValue ?? h.costBasis ?? 0) * (h.shares ?? 0);
        const sector = SECTOR_MAP[ticker] || "Other";

        if (!sectorMap.has(sector)) {
          sectorMap.set(sector, { value: 0, holdings: [] });
        }
        const entry = sectorMap.get(sector)!;
        entry.value += value;

        // Combine duplicate tickers within same sector
        const existing = entry.holdings.find((x) => x.ticker === ticker);
        if (existing) {
          existing.value += value;
        } else {
          entry.holdings.push({ ticker, value });
        }
      }

      // Convert to sorted array
      const sectorAllocations: SectorAllocation[] = Array.from(sectorMap.entries())
        .map(([sector, data]) => ({
          sector,
          value: data.value,
          percentage: total > 0 ? (data.value / total) * 100 : 0,
          holdings: data.holdings.sort((a, b) => b.value - a.value),
          color: SECTOR_COLORS[sector] || SECTOR_COLORS["Other"],
        }))
        .sort((a, b) => b.value - a.value);

      setSectors(sectorAllocations);
    } catch (err) {
      console.error("Error fetching sectors:", err);
    } finally {
      setLoading(false);
    }
  }

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
          Sector Breakdown
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Portfolio allocation across sectors · Total: {formatCurrency(totalValue)}
        </p>
      </div>

      {sectors.length === 0 ? (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <PieChart className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">
            No holdings found. Import your portfolio to see sector breakdown.
          </p>
        </div>
      ) : (
        <>
          {/* Visual bar chart */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="font-semibold text-[var(--color-text)] mb-4">
              Allocation Overview
            </h3>
            {/* Stacked bar */}
            <div className="h-8 rounded-full overflow-hidden flex mb-6">
              {sectors.map((s) => (
                <div
                  key={s.sector}
                  style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                  className="h-full transition-all hover:opacity-80"
                  title={`${s.sector}: ${s.percentage.toFixed(1)}%`}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {sectors.map((s) => (
                <div key={s.sector} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {s.sector} ({s.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="space-y-3">
            {sectors.map((sector) => (
              <div
                key={sector.sector}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: sector.color }}
                    />
                    <h4 className="font-medium text-[var(--color-text)]">
                      {sector.sector}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[var(--color-text)]">
                      {formatCurrency(sector.value)}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {sector.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${sector.percentage}%`,
                      backgroundColor: sector.color,
                    }}
                  />
                </div>
                {/* Holdings in this sector */}
                <div className="flex flex-wrap gap-2">
                  {sector.holdings.map((h) => (
                    <span
                      key={h.ticker}
                      className="text-xs bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] px-2 py-1 rounded"
                    >
                      {h.ticker} · {formatCurrency(h.value)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

// Mock data — will be replaced with real Amplify data
const portfolioSummary = {
  totalValue: 125430.5,
  totalCost: 98200.0,
  dayChange: 1245.3,
  dayChangePercent: 1.0,
  totalReturn: 27230.5,
  totalReturnPercent: 27.73,
};

const topHoldings = [
  { ticker: "AAPL", name: "Apple Inc.", value: 28500, change: 2.1 },
  { ticker: "MSFT", name: "Microsoft Corp.", value: 22100, change: -0.4 },
  { ticker: "GOOGL", name: "Alphabet Inc.", value: 18900, change: 1.5 },
  { ticker: "AMZN", name: "Amazon.com Inc.", value: 15200, change: 0.8 },
  { ticker: "NVDA", name: "NVIDIA Corp.", value: 12800, change: 3.2 },
];

const sectorAllocation = [
  { name: "Technology", percentage: 55, color: "#3b82f6" },
  { name: "Healthcare", percentage: 15, color: "#10b981" },
  { name: "Financials", percentage: 12, color: "#f59e0b" },
  { name: "Consumer", percentage: 10, color: "#8b5cf6" },
  { name: "Other", percentage: 8, color: "#6b7280" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-text-muted)]">
              Total Value
            </span>
            <DollarSign className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-text)]">
            {formatCurrency(portfolioSummary.totalValue)}
          </p>
        </div>

        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-text-muted)]">
              Day Change
            </span>
            <Activity className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-success)]">
            +{formatCurrency(portfolioSummary.dayChange)}
          </p>
          <p className="text-sm text-[var(--color-success)]">
            +{portfolioSummary.dayChangePercent}%
          </p>
        </div>

        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-text-muted)]">
              Total Return
            </span>
            <TrendingUp className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-success)]">
            +{formatCurrency(portfolioSummary.totalReturn)}
          </p>
          <p className="text-sm text-[var(--color-success)]">
            +{portfolioSummary.totalReturnPercent}%
          </p>
        </div>

        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-text-muted)]">
              Cost Basis
            </span>
            <PieChart className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-text)]">
            {formatCurrency(portfolioSummary.totalCost)}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Holdings */}
        <div className="lg:col-span-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Top Holdings
            </h2>
            <Link
              href="/portfolio"
              className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topHoldings.map((holding) => (
              <div
                key={holding.ticker}
                className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0"
              >
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {holding.ticker}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {holding.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[var(--color-text)]">
                    {formatCurrency(holding.value)}
                  </p>
                  <p
                    className={`text-sm flex items-center gap-1 justify-end ${
                      holding.change >= 0
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]"
                    }`}
                  >
                    {holding.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {holding.change >= 0 ? "+" : ""}
                    {holding.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Sector Allocation
            </h2>
            <Link
              href="/analyze/sectors"
              className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              Details <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {sectorAllocation.map((sector) => (
              <div key={sector.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {sector.name}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {sector.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${sector.percentage}%`,
                      backgroundColor: sector.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/portfolio/add"
          className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-primary)] transition-colors group"
        >
          <h3 className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
            Add Holding
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Add a new stock or ETF to your portfolio
          </p>
        </Link>
        <Link
          href="/analyze"
          className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-primary)] transition-colors group"
        >
          <h3 className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
            Run Analysis
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Get insights on risk and diversification
          </p>
        </Link>
        <Link
          href="/optimize"
          className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-primary)] transition-colors group"
        >
          <h3 className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
            Optimize Portfolio
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Get AI-powered recommendations
          </p>
        </Link>
      </div>
    </div>
  );
}

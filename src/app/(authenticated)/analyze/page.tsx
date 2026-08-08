"use client";

import Link from "next/link";
import {
  PieChart,
  Activity,
  Globe,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const analysisCards = [
  {
    title: "Sector Breakdown",
    description: "View allocation across technology, healthcare, financials, and more",
    icon: PieChart,
    href: "/analyze/sectors",
    color: "text-[var(--color-primary)]",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
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
    title: "Geographic Exposure",
    description: "US vs international vs emerging market allocation",
    icon: Globe,
    href: "/analyze/sectors",
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

// Mock portfolio health
const healthMetrics = [
  { label: "Diversification", score: 72, status: "Good" },
  { label: "Risk Level", score: 58, status: "Moderate" },
  { label: "Income Yield", score: 45, status: "Low" },
  { label: "Growth Potential", score: 85, status: "Strong" },
];

export default function AnalyzePage() {
  return (
    <div className="space-y-8">
      {/* Portfolio Health Score */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          Portfolio Health
        </h2>
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
                        : metric.score >= 50
                        ? "var(--color-warning)"
                        : "var(--color-danger)",
                  }}
                />
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                {metric.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Sections */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          Analysis Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysisCards.map((card) => (
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
          ))}
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
              Your portfolio is heavily concentrated in technology (55%). Consider
              diversifying into healthcare or consumer staples to reduce sector
              risk. Your top 3 holdings represent 55% of total value — this
              creates concentration risk.
            </p>
            <Link
              href="/ai-chat"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Ask AI for more details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

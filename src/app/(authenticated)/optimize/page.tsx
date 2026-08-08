"use client";

import { useState } from "react";
import {
  Target,
  TrendingUp,
  DollarSign,
  Shield,
  Scale,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const goals = [
  {
    id: "income",
    title: "Income Focus",
    description: "Maximize dividend income and cash flow from your portfolio",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    suggestions: [
      "Add high-yield dividend ETFs like SCHD or VYM",
      "Consider REITs for real estate income exposure",
      "Replace TSLA (0% yield) with JNJ (3.1% yield)",
      "Your projected annual income: $2,840 → $4,200",
    ],
  },
  {
    id: "growth",
    title: "Growth Focus",
    description: "Maximize capital appreciation and long-term wealth building",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    suggestions: [
      "Increase NVDA position — strong AI/ML growth tailwinds",
      "Consider adding semiconductor exposure via SMH",
      "Add small-cap growth via IWO for higher upside",
      "Your growth tilt score: 72/100 → 88/100",
    ],
  },
  {
    id: "balanced",
    title: "Balanced",
    description: "Optimize for risk-adjusted returns with steady growth",
    icon: Scale,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    suggestions: [
      "Add 15% bond allocation via BND or AGG",
      "Reduce technology concentration from 55% to 35%",
      "Add international exposure via VXUS (currently 0%)",
      "Target Sharpe ratio improvement: 0.85 → 1.12",
    ],
  },
  {
    id: "preservation",
    title: "Capital Preservation",
    description: "Minimize downside risk and protect principal",
    icon: Shield,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    suggestions: [
      "Shift 30% to treasury bonds (TLT, SHY)",
      "Add low-volatility ETF like USMV",
      "Reduce high-beta positions (NVDA, TSLA)",
      "Portfolio max drawdown: -28% → -15%",
    ],
  },
  {
    id: "tax",
    title: "Tax Efficiency",
    description: "Minimize tax drag through smart asset location",
    icon: Zap,
    color: "text-teal-600",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    suggestions: [
      "Move high-dividend AAPL from brokerage to IRA",
      "Harvest $1,200 tax loss on TSLA position",
      "Use tax-efficient index funds in taxable account",
      "Estimated annual tax savings: ~$850",
    ],
  },
];

export default function OptimizePage() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const activeGoal = goals.find((g) => g.id === selectedGoal);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Portfolio Optimizer
        </h2>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Select your investment goal to get AI-powered recommendations
        </p>
      </div>

      {/* Goal Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoal(goal.id)}
            className={`text-left bg-[var(--color-bg)] border rounded-xl p-5 transition-all ${
              selectedGoal === goal.id
                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-md"
                : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 ${goal.bgColor} rounded-lg flex items-center justify-center`}
              >
                <goal.icon className={`w-5 h-5 ${goal.color}`} />
              </div>
              {selectedGoal === goal.id && (
                <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] ml-auto" />
              )}
            </div>
            <h3 className="font-medium text-[var(--color-text)] mb-1">
              {goal.title}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {goal.description}
            </p>
          </button>
        ))}
      </div>

      {/* Recommendations */}
      {activeGoal && (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 mb-5">
            <div
              className={`w-10 h-10 ${activeGoal.bgColor} rounded-lg flex items-center justify-center`}
            >
              <activeGoal.icon className={`w-5 h-5 ${activeGoal.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">
                {activeGoal.title} Recommendations
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                AI-generated suggestions based on your current portfolio
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeGoal.suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-[var(--color-bg-secondary)] rounded-lg"
              >
                <ArrowRight className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Apply Recommendations
            </button>
            <button className="border border-[var(--color-border)] text-[var(--color-text-secondary)] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-bg-secondary)] transition-colors">
              Ask AI to Explain
            </button>
          </div>
        </div>
      )}

      {/* What-if Section */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">
            What-If Scenarios
          </h3>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Model changes to your portfolio and see the projected impact before
          making trades.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="text-left p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Add $5,000 to portfolio
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              See optimal allocation for new capital
            </p>
          </button>
          <button className="text-left p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Market crash scenario
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Simulate a 20% market decline
            </p>
          </button>
          <button className="text-left p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Rate hike impact
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Model interest rate increases
            </p>
          </button>
          <button className="text-left p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Retirement projection
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Project portfolio growth to your target date
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

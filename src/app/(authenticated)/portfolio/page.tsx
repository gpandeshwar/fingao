"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Upload,
  TrendingUp,
  TrendingDown,
  Search,
  MoreVertical,
} from "lucide-react";

// Mock data — will be replaced with Amplify data
const holdings = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    shares: 50,
    costBasis: 142.5,
    currentPrice: 185.25,
    purchaseDate: "2023-03-15",
    accountType: "Brokerage",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    shares: 30,
    costBasis: 285.0,
    currentPrice: 415.5,
    purchaseDate: "2023-05-20",
    accountType: "IRA",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    shares: 25,
    costBasis: 105.0,
    currentPrice: 152.3,
    purchaseDate: "2023-07-10",
    accountType: "Brokerage",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    shares: 40,
    costBasis: 125.0,
    currentPrice: 178.5,
    purchaseDate: "2023-01-08",
    accountType: "401k",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    shares: 20,
    costBasis: 220.0,
    currentPrice: 480.0,
    purchaseDate: "2023-09-01",
    accountType: "Brokerage",
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    shares: 15,
    costBasis: 245.0,
    currentPrice: 265.8,
    purchaseDate: "2024-01-15",
    accountType: "Brokerage",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHoldings = holdings.filter(
    (h) =>
      h.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = holdings.reduce(
    (sum, h) => sum + h.shares * h.currentPrice,
    0
  );
  const totalCost = holdings.reduce(
    (sum, h) => sum + h.shares * h.costBasis,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            My Portfolio
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {holdings.length} holdings · {formatCurrency(totalValue)} total value
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/portfolio/import"
            className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Link>
          <Link
            href="/portfolio/add"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Holding
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search by ticker or company name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
        />
      </div>

      {/* Holdings Table */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <th className="text-left px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Holding
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Shares
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Cost Basis
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Current Price
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Market Value
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Gain/Loss
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Account
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredHoldings.map((holding) => {
                const marketValue = holding.shares * holding.currentPrice;
                const gainLoss =
                  (holding.currentPrice - holding.costBasis) * holding.shares;
                const gainLossPercent =
                  ((holding.currentPrice - holding.costBasis) /
                    holding.costBasis) *
                  100;
                const isPositive = gainLoss >= 0;

                return (
                  <tr
                    key={holding.ticker}
                    className="hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/portfolio/${holding.ticker}`}>
                        <p className="font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]">
                          {holding.ticker}
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {holding.name}
                        </p>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--color-text)]">
                      {holding.shares}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--color-text)]">
                      {formatCurrency(holding.costBasis)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--color-text)]">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-[var(--color-text)]">
                      {formatCurrency(marketValue)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div
                        className={`flex items-center justify-end gap-1 text-sm ${
                          isPositive
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-danger)]"
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {formatCurrency(Math.abs(gainLoss))} (
                        {gainLossPercent.toFixed(1)}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] px-2 py-1 rounded">
                        {holding.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-[var(--color-border)]">
          {filteredHoldings.map((holding) => {
            const marketValue = holding.shares * holding.currentPrice;
            const gainLoss =
              (holding.currentPrice - holding.costBasis) * holding.shares;
            const gainLossPercent =
              ((holding.currentPrice - holding.costBasis) /
                holding.costBasis) *
              100;
            const isPositive = gainLoss >= 0;

            return (
              <Link
                key={holding.ticker}
                href={`/portfolio/${holding.ticker}`}
                className="flex items-center justify-between p-4 hover:bg-[var(--color-bg-secondary)]"
              >
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {holding.ticker}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {holding.shares} shares
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[var(--color-text)]">
                    {formatCurrency(marketValue)}
                  </p>
                  <p
                    className={`text-sm ${
                      isPositive
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {gainLossPercent.toFixed(1)}%
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

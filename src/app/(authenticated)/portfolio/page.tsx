"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Upload,
  TrendingUp,
  TrendingDown,
  Search,
  Loader2,
  Trash2,
  List,
  X,
} from "lucide-react";
import { generateClient } from "aws-amplify/data";

const client = generateClient<any>();

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  costBasis: number;
  currentValue: number;
  purchaseDate: string;
  tickerType?: string;
  notes?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    fetchHoldings();
  }, []);

  async function fetchHoldings() {
    try {
      setLoading(true);
      const response: any = await client.models.ExtractedHolding.list({});
      const items = (response.data || []).map((item: any) => ({
        id: item.id,
        ticker: item.ticker,
        shares: item.shares,
        costBasis: item.costBasis,
        currentValue: item.currentValue || item.costBasis,
        purchaseDate: item.purchaseDate || "",
        tickerType: item.tickerType || "",
        notes: item.notes || "",
      }));
      setHoldings(items);
    } catch (err) {
      console.error("Error fetching holdings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteHolding(id: string) {
    try {
      await client.models.ExtractedHolding.delete({ id });
      setHoldings((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Error deleting holding:", err);
    }
  }

  // Consolidate holdings by ticker (combine duplicate tickers)
  function consolidateHoldings(items: Holding[]): Holding[] {
    const grouped = new Map<string, Holding>();

    for (const h of items) {
      const key = h.ticker.toUpperCase();
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        const combinedShares = existing.shares + h.shares;
        const combinedTotalCost =
          existing.costBasis * existing.shares + h.costBasis * h.shares;
        const combinedTotalValue =
          existing.currentValue * existing.shares + h.currentValue * h.shares;

        grouped.set(key, {
          ...existing,
          shares: combinedShares,
          costBasis: combinedTotalCost / combinedShares, // weighted average cost
          currentValue: combinedTotalValue / combinedShares, // weighted average current
          notes: [existing.notes, h.notes].filter(Boolean).join("; "),
        });
      } else {
        grouped.set(key, { ...h });
      }
    }

    return Array.from(grouped.values());
  }

  const consolidatedHoldings = consolidateHoldings(holdings);

  const filteredHoldings = consolidatedHoldings.filter(
    (h) =>
      h.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Portfolio-level totals (use consolidated to avoid double counting)
  const portfolioTotalValue = consolidatedHoldings.reduce(
    (sum, h) => sum + h.currentValue * h.shares,
    0
  );
  const portfolioTotalCost = consolidatedHoldings.reduce(
    (sum, h) => sum + h.costBasis * h.shares,
    0
  );
  const portfolioTotalGain = portfolioTotalValue - portfolioTotalCost;
  const portfolioGainPercent =
    portfolioTotalCost > 0 ? (portfolioTotalGain / portfolioTotalCost) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            My Portfolio
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {consolidatedHoldings.length} holding{consolidatedHoldings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showTransactions
                ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
            }`}
          >
            <List className="w-4 h-4" />
            {showTransactions ? "Hide" : "Show"} Transactions
          </button>
          <Link
            href="/portfolio/import"
            className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
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

      {/* Portfolio Summary Cards */}
      {consolidatedHoldings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">
              Total Value
            </p>
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {formatCurrency(portfolioTotalValue)}
            </p>
          </div>
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">
              Total Cost
            </p>
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {formatCurrency(portfolioTotalCost)}
            </p>
          </div>
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">
              Total Gain
            </p>
            <p
              className={`text-2xl font-bold ${
                portfolioTotalGain >= 0
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-danger)]"
              }`}
            >
              {formatCurrency(portfolioTotalGain)}
            </p>
            <p
              className={`text-sm ${
                portfolioTotalGain >= 0
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-danger)]"
              }`}
            >
              {formatPercent(portfolioGainPercent)}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {consolidatedHoldings.length === 0 && (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <p className="text-lg font-medium text-[var(--color-text)] mb-2">
            No holdings yet
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Add your first holding manually or import from a file.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/portfolio/add"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Add Holding
            </Link>
            <Link
              href="/portfolio/import"
              className="border border-[var(--color-border)] text-[var(--color-text-secondary)] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              Import File
            </Link>
          </div>
        </div>
      )}

      {/* Search */}
      {consolidatedHoldings.length > 0 && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search by ticker or notes..."
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
                      Ticker
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
                      Total Value
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                      Total Gain / %
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                      Type
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredHoldings.map((holding) => {
                    const totalValue = holding.currentValue * holding.shares;
                    const totalCost = holding.costBasis * holding.shares;
                    const totalGain = totalValue - totalCost;
                    const gainPercent =
                      totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
                    const isPositive = totalGain >= 0;

                    return (
                      <tr
                        key={holding.id}
                        className="hover:bg-[var(--color-bg-secondary)] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-[var(--color-text)]">
                            {holding.ticker}
                          </p>
                          {holding.notes && (
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate max-w-[200px]">
                              {holding.notes}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-[var(--color-text)]">
                          {holding.shares}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-[var(--color-text)]">
                          {formatCurrency(holding.costBasis)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-[var(--color-text)]">
                          {formatCurrency(holding.currentValue)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-[var(--color-text)]">
                          {formatCurrency(totalValue)}
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
                            <span>
                              {formatCurrency(Math.abs(totalGain))} ({formatPercent(gainPercent)})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {holding.tickerType && (
                            <span className="text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] px-2 py-1 rounded">
                              {holding.tickerType}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteHolding(holding.id)}
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                            title="Delete holding"
                          >
                            <Trash2 className="w-4 h-4" />
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
                const totalValue = holding.currentValue * holding.shares;
                const totalCost = holding.costBasis * holding.shares;
                const totalGain = totalValue - totalCost;
                const gainPercent =
                  totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
                const isPositive = totalGain >= 0;

                return (
                  <div
                    key={holding.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="font-medium text-[var(--color-text)]">
                        {holding.ticker}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {holding.shares} shares
                      </p>
                      {holding.tickerType && (
                        <span className="text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded mt-1 inline-block">
                          {holding.tickerType}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-medium text-[var(--color-text)]">
                          {formatCurrency(totalValue)}
                        </p>
                        <p
                          className={`text-xs flex items-center justify-end gap-0.5 ${
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
                          {formatPercent(gainPercent)}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteHolding(holding.id)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                        title="Delete holding"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No results */}
            {filteredHoldings.length === 0 && searchQuery && (
              <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">
                No holdings match &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </>
      )}

      {/* Transactions Panel */}
      {showTransactions && (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <h3 className="font-semibold text-[var(--color-text)]">
              All Transactions ({holdings.length})
            </h3>
            <button
              onClick={() => setShowTransactions(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              aria-label="Close transactions"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                    Ticker
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                    Shares
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                    Cost Basis
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                    Current Value
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                    Purchase Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {holdings.map((h) => (
                  <tr
                    key={h.id}
                    className="hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-[var(--color-text)]">
                      {h.ticker}
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-[var(--color-text)]">
                      {h.shares}
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-[var(--color-text)]">
                      {formatCurrency(h.costBasis)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-[var(--color-text)]">
                      {formatCurrency(h.currentValue)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-[var(--color-text-secondary)]">
                      {h.purchaseDate || "—"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {h.tickerType && (
                        <span className="text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] px-2 py-1 rounded">
                          {h.tickerType}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => deleteHolding(h.id)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-[var(--color-border)]">
            {holdings.map((h) => (
              <div key={h.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {h.ticker}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {h.shares} shares @ {formatCurrency(h.costBasis)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {h.purchaseDate || "No date"}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {formatCurrency(h.currentValue * h.shares)}
                    </p>
                    {h.tickerType && (
                      <span className="text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded">
                        {h.tickerType}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteHolding(h.id)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

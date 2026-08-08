"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddHoldingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ticker: "",
    shares: "",
    costBasis: "",
    purchaseDate: "",
    parentTicker: "",
    accountType: "Brokerage",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Amplify/DynamoDB
    console.log("Saving holding:", formData);
    router.push("/portfolio");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/portfolio"
        className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Portfolio
      </Link>

      {/* Form */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">
          Add New Holding
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ticker */}
          <div>
            <label
              htmlFor="ticker"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
            >
              Ticker Symbol *
            </label>
            <input
              id="ticker"
              type="text"
              required
              placeholder="e.g. AAPL"
              value={formData.ticker}
              onChange={(e) =>
                setFormData({ ...formData, ticker: e.target.value.toUpperCase() })
              }
              className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Shares & Cost Basis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="shares"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >
                Number of Shares *
              </label>
              <input
                id="shares"
                type="number"
                required
                step="0.001"
                placeholder="e.g. 50"
                value={formData.shares}
                onChange={(e) =>
                  setFormData({ ...formData, shares: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label
                htmlFor="costBasis"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >
                Cost Basis (per share) *
              </label>
              <input
                id="costBasis"
                type="number"
                required
                step="0.01"
                placeholder="e.g. 142.50"
                value={formData.costBasis}
                onChange={(e) =>
                  setFormData({ ...formData, costBasis: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Purchase Date & Account Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="purchaseDate"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >
                Purchase Date *
              </label>
              <input
                id="purchaseDate"
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label
                htmlFor="accountType"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >
                Account Type
              </label>
              <select
                id="accountType"
                value={formData.accountType}
                onChange={(e) =>
                  setFormData({ ...formData, accountType: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              >
                <option value="Brokerage">Brokerage</option>
                <option value="IRA">IRA</option>
                <option value="Roth IRA">Roth IRA</option>
                <option value="401k">401(k)</option>
              </select>
            </div>
          </div>

          {/* Parent Ticker */}
          <div>
            <label
              htmlFor="parentTicker"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
            >
              Parent Ticker (optional)
            </label>
            <input
              id="parentTicker"
              type="text"
              placeholder="e.g. VTI (if this is a sub-holding)"
              value={formData.parentTicker}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parentTicker: e.target.value.toUpperCase(),
                })
              }
              className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Any notes about this investment..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Add Holding
            </button>
            <Link
              href="/portfolio"
              className="px-6 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

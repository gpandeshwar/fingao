"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { uploadData, getUrl } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";
import outputs from "../../../../../amplify_outputs.json";

const client = generateClient<any>();

// Get the storage bucket name from amplify_outputs.json
function getStorageBucketName(): string {
  return (outputs as any)?.storage?.bucket_name || "";
}

interface ExtractedHolding {
  ticker: string;
  shares: number;
  costBasis: number;
  purchaseDate?: string;
  accountType?: string;
  notes?: string;
  selected?: boolean;
}

type ImportStep = "upload" | "extracting" | "review" | "saving" | "done" | "error";

export default function ImportPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<ImportStep>("upload");
  const [holdings, setHoldings] = useState<ExtractedHolding[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setStep("extracting");
      setProgress("Uploading file...");

      // 1. Upload to S3 via Amplify Storage
      const session = await fetchAuthSession();
      const identityId = session.identityId;
      const fileKey = `uploads/${identityId}/${Date.now()}-${file.name}`;
      const uploadResult = await uploadData({
        path: fileKey,
        data: file,
        options: {
          contentType: file.type || "application/octet-stream",
        },
      }).result;

      setProgress("Analyzing document with AI...");

      // 2. Call the extraction Lambda via AppSync custom query
      const bucketName = getStorageBucketName();
      const response: any = await client.queries.extractPortfolioFromFile({
        bucket: bucketName,
        key: fileKey,
      });

      if (response.data?.success) {
        const extractedHoldings = (response.data.holdings || []).map(
          (h: any) => ({
            ...h,
            selected: true,
          })
        );
        setHoldings(extractedHoldings);
        setSummary(response.data.summary || "");
        setStep("review");
      } else {
        setError(
          response.data?.error || "Failed to extract holdings from file"
        );
        setStep("error");
      }
    } catch (err: any) {
      console.error("Import error:", err);
      setError(err.message || "An unexpected error occurred");
      setStep("error");
    }
  };

  const toggleHolding = (index: number) => {
    setHoldings((prev) =>
      prev.map((h, i) => (i === index ? { ...h, selected: !h.selected } : h))
    );
  };

  const selectAll = () => {
    setHoldings((prev) => prev.map((h) => ({ ...h, selected: true })));
  };

  const deselectAll = () => {
    setHoldings((prev) => prev.map((h) => ({ ...h, selected: false })));
  };

  const handleSave = async () => {
    const selectedHoldings = holdings.filter((h) => h.selected);
    if (selectedHoldings.length === 0) return;

    try {
      setStep("saving");
      setProgress(`Saving ${selectedHoldings.length} holdings...`);

      // Get the current user's ID
      const session = await fetchAuthSession();
      const userId = session.userSub || "";

      // Save each holding to ExtractedHolding table via AppSync
      for (const holding of selectedHoldings) {
        await client.models.ExtractedHolding.create({
          userId,
          ticker: holding.ticker,
          shares: holding.shares,
          costBasis: holding.costBasis,
          purchaseDate: holding.purchaseDate || new Date().toISOString().split("T")[0],
          accountType: holding.accountType || "",
          notes: holding.notes || "",
        });
      }

      setStep("done");
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save holdings");
      setStep("error");
    }
  };

  // Upload Step
  if (step === "upload") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/portfolio"
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </Link>

        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">
            Import Portfolio
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Upload a CSV, screenshot, or PDF of your brokerage statement. Our AI
            will extract your holdings automatically.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
              isDragging
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                : file
                ? "border-[var(--color-success)] bg-green-50 dark:bg-green-950/10"
                : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-[var(--color-success)]" />
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {file.name}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-sm text-[var(--color-danger)] hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-[var(--color-text-muted)]" />
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    Drop your file here
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    CSV, PDF, PNG, JPG supported
                  </p>
                </div>
                <label className="cursor-pointer bg-[var(--color-bg-secondary)] border border-[var(--color-border)] px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept=".csv,.pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Expected format */}
          <div className="mt-6 p-4 bg-[var(--color-bg-secondary)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[var(--color-text-muted)]" />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                Supported formats
              </span>
            </div>
            <ul className="text-xs text-[var(--color-text-muted)] space-y-1">
              <li>• CSV with columns: ticker, shares, costBasis, purchaseDate</li>
              <li>• Screenshot of your brokerage holdings page</li>
              <li>• PDF brokerage statement</li>
              <li>• Any document showing your investment positions</li>
            </ul>
          </div>

          {/* Action */}
          {file && (
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleImport}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Extract Holdings
              </button>
              <button
                onClick={() => setFile(null)}
                className="px-6 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Extracting Step
  if (step === "extracting" || step === "saving") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            {step === "extracting" ? "Analyzing Your Document" : "Saving Holdings"}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">{progress}</p>
        </div>
      </div>
    );
  }

  // Review Step
  if (step === "review") {
    const selectedCount = holdings.filter((h) => h.selected).length;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/portfolio"
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </Link>

        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                Review Extracted Holdings
              </h2>
              {summary && (
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {summary}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Select All
              </button>
              <span className="text-[var(--color-text-muted)]">|</span>
              <button
                onClick={deselectAll}
                className="text-xs text-[var(--color-text-muted)] hover:underline"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Holdings list */}
          <div className="space-y-2">
            {holdings.map((holding, index) => (
              <div
                key={index}
                onClick={() => toggleHolding(index)}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                  holding.selected
                    ? "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5"
                    : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] opacity-60"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    holding.selected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  {holding.selected && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Ticker
                    </p>
                    <p className="font-medium text-[var(--color-text)]">
                      {holding.ticker}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Shares
                    </p>
                    <p className="text-sm text-[var(--color-text)]">
                      {holding.shares}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Cost Basis
                    </p>
                    <p className="text-sm text-[var(--color-text)]">
                      ${holding.costBasis.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Date
                    </p>
                    <p className="text-sm text-[var(--color-text)]">
                      {holding.purchaseDate || "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">
              {selectedCount} of {holdings.length} holdings selected
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setStep("upload");
                  setHoldings([]);
                  setFile(null);
                }}
                className="px-5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleSave}
                disabled={selectedCount === 0}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Save {selectedCount} Holdings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Done Step
  if (step === "done") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-[var(--color-success)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            Import Complete!
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            {holdings.filter((h) => h.selected).length} holdings have been added
            to your portfolio.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/portfolio"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              View Portfolio
            </Link>
            <button
              onClick={() => {
                setStep("upload");
                setHoldings([]);
                setFile(null);
              }}
              className="px-6 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              Import More
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error Step
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-[var(--color-bg)] border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-[var(--color-danger)] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Import Failed
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
          {error}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setStep("upload");
              setError("");
            }}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/portfolio"
            className="px-6 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Back to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

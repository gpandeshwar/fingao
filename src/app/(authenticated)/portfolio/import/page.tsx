"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle2 } from "lucide-react";

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

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
          Import from CSV
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Upload a CSV file with your holdings. Expected columns: ticker,
          shares, costBasis, purchaseDate, accountType (optional), notes
          (optional).
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
                  Drop your CSV file here
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  or click to browse
                </p>
              </div>
              <label className="cursor-pointer bg-[var(--color-bg-secondary)] border border-[var(--color-border)] px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
                Choose File
                <input
                  type="file"
                  accept=".csv"
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
              Expected CSV format
            </span>
          </div>
          <code className="text-xs text-[var(--color-text-muted)] block">
            ticker,shares,costBasis,purchaseDate,accountType,notes
            <br />
            AAPL,50,142.50,2023-03-15,Brokerage,Long-term hold
            <br />
            MSFT,30,285.00,2023-05-20,IRA,
          </code>
        </div>

        {/* Action */}
        {file && (
          <div className="mt-6 flex items-center gap-3">
            <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Import Holdings
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

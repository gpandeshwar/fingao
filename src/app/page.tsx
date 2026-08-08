"use client";

import Link from "next/link";
import {
  TrendingUp,
  PieChart,
  Target,
  ArrowRight,
  BarChart3,
  Shield,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-[var(--color-primary)]" />
            <span className="text-xl font-bold text-[var(--color-text)]">
              FinGao
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] leading-tight">
            Smart Portfolio
            <span className="text-[var(--color-primary)]"> Management</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-2xl mx-auto">
            Gather your investments, analyze performance with AI-powered
            insights, and optimize your portfolio for your financial goals.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto border border-[var(--color-border)] text-[var(--color-text)] px-8 py-3 rounded-lg font-medium hover:bg-[var(--color-bg-secondary)] transition-colors text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)]">
            Three Pillars of Portfolio Intelligence
          </h2>
          <p className="mt-4 text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
            A complete workflow from data collection to actionable
            recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Gather */}
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
              <PieChart className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
              Gather
            </h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Import your holdings from any brokerage. Track stocks, ETFs, and
              funds across multiple accounts in one place.
            </p>
          </div>

          {/* Analyze */}
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-[var(--color-success)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
              Analyze
            </h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Understand your portfolio from every angle — sector breakdown, risk
              metrics, performance attribution, and AI-powered insights.
            </p>
          </div>

          {/* Optimize */}
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-[var(--color-warning)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
              Optimize
            </h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Get personalized recommendations based on your goals — whether
              income, growth, or balanced. AI suggests specific actions.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Secure & Private
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-4">
            Your data stays yours
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
            End-to-end encryption, no data selling, and full control over your
            financial information. Built on AWS with enterprise-grade security.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--color-text-muted)]" />
            <span className="text-sm text-[var(--color-text-muted)]">
              © 2026 FinGao. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
            <a href="#" className="hover:text-[var(--color-text)] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[var(--color-text)] transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[var(--color-text)] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthenticator((context) => [context.user]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-text)]">Settings</h2>

      {/* Profile */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-[var(--color-text-secondary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Profile</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              disabled
              value={user?.signInDetails?.loginId || "user@example.com"}
              className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-muted)]"
            />
          </div>
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-[var(--color-text-secondary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">
            Preferences
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">
                Dark Mode
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Follow system preference
              </p>
            </div>
            <select className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]">
              <option>System</option>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">
                Currency
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Display currency for values
              </p>
            </div>
            <select className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">
            Notifications
          </h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "Price alerts", desc: "When a stock hits your target price" },
            { label: "Portfolio insights", desc: "Weekly AI-generated summaries" },
            { label: "Rebalancing reminders", desc: "When allocations drift significantly" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {item.label}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {item.desc}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-[var(--color-bg-tertiary)] peer-checked:bg-[var(--color-primary)] rounded-full peer transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-[var(--color-text-secondary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Security</h3>
        </div>
        <div className="space-y-3">
          <button className="text-sm text-[var(--color-primary)] hover:underline">
            Change password
          </button>
          <br />
          <button className="text-sm text-[var(--color-primary)] hover:underline">
            Enable two-factor authentication
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

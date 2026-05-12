"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/dashboard/AuthGate";

type SettingsState = {
  platformFee: number;
  maintenanceMode: boolean;
  paymentMethods: Record<"ETH" | "USDT" | "USDC" | "BTC", boolean>;
};

const storageKey = "crypto-couture-admin-settings";
const defaultSettings: SettingsState = {
  platformFee: 7.5,
  maintenanceMode: false,
  paymentMethods: {
    ETH: true,
    USDT: true,
    USDC: true,
    BTC: true,
  },
};

export function AdminSettingsClient() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        setSettings(JSON.parse(raw) as SettingsState);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [ready, settings]);

  return (
    <AuthGate
      role="admin"
      title="Connect Admin Account"
      description="Configure platform fee, payment availability, and maintenance mode with local persistence."
    >
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Platform fee</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={settings.platformFee}
              onChange={(event) => setSettings((current) => ({ ...current, platformFee: Number(event.target.value) }))}
              className="w-full max-w-xl"
            />
            <span className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white">
              {settings.platformFee.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Payment methods</p>
            <div className="mt-4 space-y-3">
              {Object.entries(settings.paymentMethods).map(([method, enabled]) => (
                <label key={method} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
                  <span>{method}</span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        paymentMethods: {
                          ...current.paymentMethods,
                          [method]: event.target.checked,
                        },
                      }))
                    }
                    className="h-4 w-4"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Maintenance mode</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <label className="flex items-center justify-between gap-4 text-sm text-slate-200">
                <span>Pause buyer-facing activity</span>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(event) => setSettings((current) => ({ ...current, maintenanceMode: event.target.checked }))}
                  className="h-4 w-4"
                />
              </label>
              <p className="mt-3 text-sm text-slate-400">
                {settings.maintenanceMode
                  ? "Maintenance mode enabled. Surface messaging would be shown in a real deployment."
                  : "Maintenance mode disabled. Marketplace remains publicly available."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </AuthGate>
  );
}

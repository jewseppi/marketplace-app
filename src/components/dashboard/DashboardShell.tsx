"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type DashboardNavItem = {
  href: string;
  label: string;
};

export function DashboardShell({
  title,
  accent,
  nav,
  children,
}: {
  title: string;
  accent: string;
  nav: DashboardNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mb-8 space-y-3">
            <Link href="/" className="text-sm uppercase tracking-[0.35em] text-slate-400 transition hover:text-white">
              Crypto Couture
            </Link>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${accent}`}>Control surface</p>
              <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
            </div>
          </div>

          <nav className="space-y-2">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs opacity-60">→</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 py-1">{children}</main>
      </div>
    </div>
  );
}

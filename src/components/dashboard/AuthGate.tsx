"use client";

import { useState } from "react";
import { login, logout, type AuthRole, useMockSession } from "@/lib/mock-auth";

export function AuthGate({
  role,
  title,
  description,
  children,
}: {
  role: AuthRole;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const session = useMockSession();
  const [username, setUsername] = useState<string>(role);
  const [password, setPassword] = useState(role === "seller" ? "seller123" : "admin123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authorized = session?.role === role;

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(role, { username, password });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authorized) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="max-w-md space-y-4">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
            Mock access
          </span>
          <div>
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
            <p className="mt-2 text-sm text-slate-300">{description}</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Username</label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
              />
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
            >
              {submitting ? "Connecting..." : title}
            </button>
            <p className="text-xs text-slate-400">
              Demo credentials: <span className="font-mono text-slate-200">{role}</span> / <span className="font-mono text-slate-200">{role}123</span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-slate-950/60 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Signed in</p>
          <p className="mt-1 text-sm text-slate-300">{session.displayName} • {session.username}</p>
        </div>
        <button
          onClick={() => logout()}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/5"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}

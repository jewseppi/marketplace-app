"use client";

import { useState } from "react";
import { AuthGate } from "@/components/dashboard/AuthGate";
import {
  addMockUser,
  removeMockUser,
  toggleMockUserStatus,
  useMockUsers,
  type UserRole,
} from "@/lib/mock-auth";

export function AdminUsersClient() {
  const users = useMockUsers();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");

  return (
    <AuthGate
      role="admin"
      title="Connect Admin Account"
      description="Manage mock marketplace users, roles, and status flags."
    >
      <section className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Add mock user</p>
            <div className="mt-4 space-y-4">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                {(["buyer", "seller", "admin"] as const).map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!name || !email) {
                    return;
                  }
                  addMockUser({ name, email, role, status: "active" });
                  setName("");
                  setEmail("");
                  setRole("buyer");
                }}
                className="w-full rounded-2xl bg-fuchsia-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-200"
              >
                Add user
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {users.map((user) => (
              <article key={user.id} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {user.role}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        user.status === "active" ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleMockUserStatus(user.id)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    {user.status === "active" ? "Suspend" : "Reactivate"}
                  </button>
                  <button
                    onClick={() => removeMockUser(user.id)}
                    className="rounded-full border border-rose-400/30 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-400/10"
                  >
                    Remove user
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AuthGate>
  );
}

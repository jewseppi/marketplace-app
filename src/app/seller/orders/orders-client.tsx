"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dashboard/AuthGate";
import type { Order } from "@/data/products";
import type { OrderDetail } from "@/db";
import { saveOrderStatus } from "../actions";

const statuses: Array<Order["status"] | "all"> = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

function downloadCsv(orders: OrderDetail[]) {
  const rows = [
    ["order_id", "status", "customer_email", "payment_method", "total", "items", "created_at"],
    ...orders.map((order) => [
      order.id,
      order.status,
      order.customerEmail,
      order.paymentMethod,
      order.total.toFixed(2),
      order.items.map((item) => `${item.title} x${item.quantity}`).join(" | "),
      order.createdAt,
    ]),
  ];

  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "seller-orders.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function SellerOrdersClient({ initialOrders }: { initialOrders: OrderDetail[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [saving, startSaving] = useTransition();

  const filteredOrders = useMemo(
    () => (filter === "all" ? orders : orders.filter((order) => order.status === filter)),
    [filter, orders],
  );

  return (
    <AuthGate
      role="seller"
      title="Connect Seller Account"
      description="Review checkout orders, track payment state, and export the latest activity."
    >
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/10 bg-slate-900/70 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Order desk</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Seller orders</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as Order["status"] | "all")}
              className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              onClick={() => downloadCsv(filteredOrders)}
              className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/40 p-8 text-sm text-slate-400">
              No orders match this filter yet.
            </div>
          ) : null}

          {filteredOrders.map((order) => (
            <article key={order.id} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{order.id}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{order.customerEmail}</h2>
                  <p className="mt-1 text-sm text-slate-400">Placed {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="min-w-[200px] space-y-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <select
                      value={order.status}
                      onChange={(event) => {
                        const nextStatus = event.target.value as Order["status"];
                        setOrders((current) => current.map((entry) => (entry.id === order.id ? { ...entry, status: nextStatus } : entry)));
                        startSaving(async () => {
                          await saveOrderStatus(order.id, nextStatus);
                          router.refresh();
                        });
                      }}
                      disabled={saving}
                      className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm text-white outline-none"
                    >
                      {statuses.filter((status) => status !== "all").map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <strong className="text-white">${order.total.toLocaleString()}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment</span>
                    <strong className="text-white">{order.paymentMethod}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-sm font-semibold text-white">Order details</p>
                  <div className="mt-4 space-y-3">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.productId}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="text-slate-400">{item.category} • {item.sku}</p>
                        </div>
                        <div className="text-right text-slate-300">
                          <p>x{item.quantity}</p>
                          <p>${item.lineTotal.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Payment info</p>
                  <div className="mt-4 space-y-2">
                    <p>Customer: {order.customerEmail}</p>
                    <p>Wallet: {order.walletAddress ?? "not provided"}</p>
                    <p>Expires: {order.paymentExpiresAt ? new Date(order.paymentExpiresAt).toLocaleString() : "n/a"}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AuthGate>
  );
}

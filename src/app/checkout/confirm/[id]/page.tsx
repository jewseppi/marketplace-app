"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import Header from "@/app/header";
import { ErrorToast } from "@/components/ui/ErrorToast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type ConfirmationPayload = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  payment: {
    currency: string;
    walletAddress: string;
    expiresAt: string;
  };
  txHashes?: string[];
  mockOrderIds?: number[];
};

function fallbackHash(seed: string, index: number) {
  const base = `${seed.replace(/-/g, "")}${index.toString(16).padStart(2, "0")}`;
  return `0x${base.padEnd(64, "a").slice(0, 64)}`;
}

export default function CheckoutConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<ConfirmationPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/orders?orderId=${id}`, { cache: "no-store" });
        const payload = (await response.json()) as { order?: Record<string, unknown>; error?: string };
        if (!response.ok || !payload.order) {
          throw new Error(payload.error || "Order not found");
        }

        const stored = window.sessionStorage.getItem(`crypto-couture-order:${id}`);
        const sessionOrder = stored ? (JSON.parse(stored) as ConfirmationPayload) : null;

        if (!active) return;

        setOrder({
          id,
          status: String(payload.order.status ?? sessionOrder?.status ?? "pending"),
          total: Number(payload.order.total ?? sessionOrder?.total ?? 0),
          createdAt: String(payload.order.createdAt ?? sessionOrder?.createdAt ?? new Date().toISOString()),
          payment: {
            currency: String(payload.order.paymentMethod ?? sessionOrder?.payment.currency ?? "BTC"),
            walletAddress: String(payload.order.walletAddress ?? sessionOrder?.payment.walletAddress ?? "Mock wallet"),
            expiresAt: String(payload.order.paymentExpiresAt ?? sessionOrder?.payment.expiresAt ?? new Date().toISOString()),
          },
          txHashes: sessionOrder?.txHashes,
          mockOrderIds: sessionOrder?.mockOrderIds,
        });
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load order confirmation.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrder();
    return () => {
      active = false;
    };
  }, [id]);

  const txHashes = useMemo(() => {
    if (!order) return [];
    if (order.txHashes?.length) return order.txHashes;
    return [fallbackHash(order.id, 1)];
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto flex max-w-4xl items-center justify-center px-6 pt-32">
          <LoadingSpinner size="lg" label="Loading confirmation" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-3xl px-6 pt-32">
          <ErrorToast title="Confirmation unavailable" message={error || "Order details were not found."} />
          <Link href="/" className="mt-6 inline-block rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-4xl px-6 pb-16 pt-28">
        <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                Order confirmed
              </span>
              <h1 className="mt-4 text-4xl font-light text-gray-900">Thanks — your demo order is in.</h1>
              <p className="mt-3 max-w-2xl text-gray-600">
                This prototype simulates a crypto payment flow. Use the details below to continue testing fulfillment, seller dashboards, and admin reporting.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-200 bg-white px-5 py-4 text-sm text-gray-700">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Order ID</p>
              <p className="mt-2 font-mono text-xs break-all">{order.id}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <section className="space-y-6 rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Payment overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">Mock chain confirmation</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Status</p>
                <p className="mt-2 font-semibold capitalize text-gray-900">{order.status}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Total</p>
                <p className="mt-2 font-semibold text-gray-900">${order.total.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Payment token</p>
                <p className="mt-2 font-semibold text-gray-900">{order.payment.currency}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Confirmed at</p>
                <p className="mt-2 font-semibold text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Wallet</p>
              <p className="mt-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 font-mono text-xs text-gray-700 break-all">
                {order.payment.walletAddress}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Transaction hash{txHashes.length === 1 ? "" : "es"}</p>
              <div className="mt-3 space-y-3">
                {txHashes.map((hash) => (
                  <div key={hash} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 font-mono text-xs text-gray-700 break-all">
                    {hash}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6 rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Mock payment instructions</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li>• Treat this as a confirmed prototype payment — no real funds moved.</li>
                <li>• Seller dashboards should now reflect the new order.</li>
                <li>• Admin reporting uses this order for gross revenue + fee metrics.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4 text-sm text-yellow-900">
              <p className="font-semibold">Expires</p>
              <p className="mt-1 text-yellow-800">{new Date(order.payment.expiresAt).toLocaleString()}</p>
            </div>

            {order.mockOrderIds?.length ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Mock contract order IDs</p>
                <p className="mt-2">{order.mockOrderIds.join(", ")}</p>
              </div>
            ) : null}

            <Link href="/" className="inline-flex w-full items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
              Back to Shop
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

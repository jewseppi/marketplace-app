import { AuthGate } from "@/components/dashboard/AuthGate";
import { listOrderDetails, listSellerProducts } from "@/db";

export default function SellerAnalyticsPage() {
  const orders = listOrderDetails();
  const products = listSellerProducts().filter((product) => !product.deletedAt);

  const last30Days = Array.from({ length: 6 }, (_, index) => ({
    label: `W${index + 1}`,
    value: 20 + ((index * 13) % 60),
  }));

  const topProducts = products
    .map((product) => {
      const unitsSold = orders.reduce(
        (sum, order) => sum + order.items.filter((item) => item.productId === product.id).reduce((count, item) => count + item.quantity, 0),
        0,
      );
      return { product, unitsSold };
    })
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 4);

  const categoryBreakdown = products.map((product) => product.category).reduce<Record<string, number>>((acc, category) => {
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});

  const statusBreakdown = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AuthGate
      role="seller"
      title="Connect Seller Account"
      description="Use the mock seller account to review simple CSS-based sales analytics."
    >
      <section className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Revenue over time</p>
            <div className="mt-6 flex items-end gap-4">
              {last30Days.map((point) => (
                <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-56 w-full items-end rounded-3xl bg-slate-950/70 p-3">
                    <div className="w-full rounded-2xl bg-gradient-to-t from-cyan-500 via-sky-400 to-cyan-200" style={{ height: `${point.value}%` }} />
                  </div>
                  <div className="text-center text-sm text-slate-300">{point.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Order status mix</p>
            <div className="mt-6 flex justify-center">
              <div
                className="h-52 w-52 rounded-full"
                style={{
                  background: `conic-gradient(
                    #67e8f9 0 ${Math.max(5, (statusBreakdown.pending ?? 0) * 20)}%,
                    #818cf8 ${Math.max(5, (statusBreakdown.pending ?? 0) * 20)}% ${Math.max(15, ((statusBreakdown.pending ?? 0) + (statusBreakdown.confirmed ?? 0)) * 20)}%,
                    #34d399 ${Math.max(15, ((statusBreakdown.pending ?? 0) + (statusBreakdown.confirmed ?? 0)) * 20)}% ${Math.max(25, ((statusBreakdown.pending ?? 0) + (statusBreakdown.confirmed ?? 0) + (statusBreakdown.shipped ?? 0)) * 20)}%,
                    #fbbf24 ${Math.max(25, ((statusBreakdown.pending ?? 0) + (statusBreakdown.confirmed ?? 0) + (statusBreakdown.shipped ?? 0)) * 20)}% ${Math.max(35, ((statusBreakdown.pending ?? 0) + (statusBreakdown.confirmed ?? 0) + (statusBreakdown.shipped ?? 0) + (statusBreakdown.delivered ?? 0)) * 20)}%,
                    #fb7185 ${Math.max(35, ((statusBreakdown.pending ?? 0) + (statusBreakdown.confirmed ?? 0) + (statusBreakdown.shipped ?? 0) + (statusBreakdown.delivered ?? 0)) * 20)}% 100%
                  )`,
                }}
              />
            </div>
            <div className="mt-6 space-y-2 text-sm text-slate-300">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-full border border-white/10 px-4 py-2">
                  <span className="capitalize">{status}</span>
                  <strong className="text-white">{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Top products</p>
            <div className="mt-5 space-y-4">
              {topProducts.map(({ product, unitsSold }) => (
                <div key={product.id}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{product.title}</span>
                    <span>{unitsSold} sold</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-950/70">
                    <div className="h-3 rounded-full bg-cyan-300" style={{ width: `${Math.max(10, unitsSold * 20)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Category breakdown</p>
            <div className="mt-5 space-y-4">
              {Object.entries(categoryBreakdown).map(([category, count]) => (
                <div key={category}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span className="capitalize">{category}</span>
                    <span>{count} products</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-950/70">
                    <div className="h-3 rounded-full bg-violet-300" style={{ width: `${(count / Math.max(products.length, 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AuthGate>
  );
}

import { AuthGate } from "@/components/dashboard/AuthGate";
import { listOrderDetails, listSellerProducts } from "@/db";
import { DEFAULT_MOCK_USERS } from "@/lib/mock-users";

const PLATFORM_FEE = 0.075;

export default function AdminReportsPage() {
  const orders = listOrderDetails();
  const products = listSellerProducts().filter((product) => !product.deletedAt);
  const users = DEFAULT_MOCK_USERS;
  const grossRevenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);
  const feeRevenue = grossRevenue * PLATFORM_FEE;
  const topSellers = [
    { name: "Atelier Seller", value: grossRevenue * 0.58 },
    { name: "Guest Consignor", value: grossRevenue * 0.27 },
    { name: "Archive Partner", value: grossRevenue * 0.15 },
  ];
  const categoryPerformance = products.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] ?? 0) + product.price;
    return acc;
  }, {});
  const userGrowth = [14, 19, 24, 31, 37, users.length + 36];

  return (
    <AuthGate
      role="admin"
      title="Connect Admin Account"
      description="Mock reporting for revenue, seller performance, and platform growth."
    >
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Gross revenue", value: `$${grossRevenue.toLocaleString()}` },
            { label: "Platform fee", value: `${(PLATFORM_FEE * 100).toFixed(1)}%` },
            { label: "Fee revenue", value: `$${feeRevenue.toLocaleString()}` },
            { label: "Live categories", value: Object.keys(categoryPerformance).length.toString() },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Top sellers</p>
            <div className="mt-5 space-y-4">
              {topSellers.map((seller) => (
                <div key={seller.name}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{seller.name}</span>
                    <span>${seller.value.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-950/70">
                    <div className="h-3 rounded-full bg-fuchsia-300" style={{ width: `${(seller.value / Math.max(grossRevenue, 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">User growth</p>
            <div className="mt-6 flex items-end gap-3">
              {userGrowth.map((value, index) => (
                <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-52 w-full items-end rounded-3xl bg-slate-950/70 p-3">
                    <div className="w-full rounded-2xl bg-gradient-to-t from-fuchsia-500 to-fuchsia-200" style={{ height: `${Math.min(100, value * 2)}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">M{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Category performance</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Object.entries(categoryPerformance).map(([category, value]) => (
              <div key={category} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span className="capitalize">{category}</span>
                  <span>${value.toLocaleString()}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-900">
                  <div className="h-3 rounded-full bg-indigo-300" style={{ width: `${(value / Math.max(grossRevenue, 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AuthGate>
  );
}

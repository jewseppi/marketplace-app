import Link from "next/link";
import { AuthGate } from "@/components/dashboard/AuthGate";
import { listOrderDetails, listSellerProducts } from "@/db";

export default function SellerDashboardPage() {
  const products = listSellerProducts();
  const orders = listOrderDetails();
  const liveProducts = products.filter((product) => !product.deletedAt);
  const completedOrders = orders.filter((order) => order.status !== "cancelled");
  const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const inventoryCount = liveProducts.length;
  const chartData = [
    { label: "Week 1", value: 32 },
    { label: "Week 2", value: 56 },
    { label: "Week 3", value: 44 },
    { label: "Week 4", value: 78 },
  ];

  return (
    <AuthGate
      role="seller"
      title="Connect Seller Account"
      description="Use the demo seller credentials to access inventory, order, and revenue controls."
    >
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total sales", value: `$${totalSales.toLocaleString()}` },
            { label: "Pending orders", value: pendingOrders.toString() },
            { label: "Inventory count", value: inventoryCount.toString() },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Revenue pulse</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Mock monthly performance</h2>
              </div>
              <p className="text-sm text-slate-400">Last 30 days</p>
            </div>
            <div className="mt-8 flex items-end gap-4">
              {chartData.map((point) => (
                <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-52 w-full items-end rounded-3xl bg-slate-950/70 p-3">
                    <div className="w-full rounded-2xl bg-gradient-to-t from-cyan-500 to-cyan-200" style={{ height: `${point.value}%` }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">{point.label}</p>
                    <p className="text-xs text-slate-400">{point.value} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Quick links</p>
              <div className="mt-4 space-y-3">
                {[
                  { href: "/seller/products", label: "Manage products", detail: "Pricing, stock, and image URLs" },
                  { href: "/seller/orders", label: "Review orders", detail: "Status updates and CSV export" },
                  { href: "/seller/analytics", label: "View analytics", detail: "Top products and category mix" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/40 hover:bg-white/10">
                    <p className="font-medium text-white">{link.label}</p>
                    <p className="mt-1 text-sm text-slate-400">{link.detail}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">At a glance</p>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <p>{orders.length} tracked orders across crypto checkout flows.</p>
                <p>{liveProducts.filter((product) => product.inStock).length} active listings currently marked in stock.</p>
                <p>{products.filter((product) => product.deletedAt).length} archived items preserved via soft delete.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AuthGate>
  );
}

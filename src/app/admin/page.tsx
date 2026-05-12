import Link from "next/link";
import { AuthGate } from "@/components/dashboard/AuthGate";
import { listOrderDetails, listSellerProducts } from "@/db";
import { DEFAULT_MOCK_USERS } from "@/lib/mock-users";

export default function AdminDashboardPage() {
  const orders = listOrderDetails();
  const products = listSellerProducts();
  const users = DEFAULT_MOCK_USERS;
  const totalRevenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);
  const stats = [
    { label: "Total users", value: users.length.toString() },
    { label: "Total revenue", value: `$${totalRevenue.toLocaleString()}` },
    { label: "Total orders", value: orders.length.toString() },
    { label: "Active listings", value: products.filter((product) => !product.deletedAt && product.inStock).length.toString() },
  ];

  return (
    <AuthGate
      role="admin"
      title="Connect Admin Account"
      description="Use the mock admin credentials to access platform controls and reporting."
    >
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Platform snapshot</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Buyer accounts", value: users.filter((user) => user.role === "buyer").length },
                { label: "Seller accounts", value: users.filter((user) => user.role === "seller").length },
                { label: "Suspended", value: users.filter((user) => user.status === "suspended").length },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-center">
                  <p className="text-3xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Quick links</p>
            <div className="mt-4 space-y-3">
              {[
                { href: "/admin/users", label: "Users", detail: "Role and suspension controls" },
                { href: "/admin/reports", label: "Reports", detail: "Revenue, sellers, categories" },
                { href: "/admin/settings", label: "Settings", detail: "Fees, payments, maintenance" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-fuchsia-300/40 hover:bg-white/10">
                  <p className="font-medium text-white">{link.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{link.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AuthGate>
  );
}

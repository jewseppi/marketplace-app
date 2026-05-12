import { DashboardShell } from "@/components/dashboard/DashboardShell";

const nav = [
  { href: "/seller", label: "Overview" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/analytics", label: "Analytics" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Seller Dashboard" accent="text-cyan-200" nav={nav}>
      {children}
    </DashboardShell>
  );
}

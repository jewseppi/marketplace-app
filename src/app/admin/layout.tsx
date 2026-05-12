import { DashboardShell } from "@/components/dashboard/DashboardShell";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Admin Panel" accent="text-fuchsia-200" nav={nav}>
      {children}
    </DashboardShell>
  );
}

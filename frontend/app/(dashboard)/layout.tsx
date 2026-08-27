import { AdminSidebar } from "@/components/admin-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}

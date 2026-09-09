import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminTopbar } from "./_components/admin-topbar";

export const metadata = { title: "Admin" };

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <AdminSidebar />
      </div>
      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <AdminTopbar />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

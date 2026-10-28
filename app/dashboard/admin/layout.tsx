import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminTopbar } from "./_components/admin-topbar";

export const metadata = { title: "Admin" };

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <AdminSidebar />
      </div>
      <div className="flex min-h-screen w-full flex-col lg:pl-63">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-310 flex-1 px-4 pt-5 pb-16 sm:px-8 sm:pt-8">{children}</main>
      </div>
    </div>
  );
}

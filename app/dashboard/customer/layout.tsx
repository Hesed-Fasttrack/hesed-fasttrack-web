import { CustomerSidebar } from "./_components/customer-sidebar";
import { CustomerTopbar } from "./_components/customer-topbar";

export const metadata = { title: "My shipping" };

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <CustomerSidebar />
      </div>
      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <CustomerTopbar />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

import { CustomerSidebar } from "./_components/customer-sidebar";
import { CustomerTopbar } from "./_components/customer-topbar";

export const metadata = { title: "My shipping" };

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <CustomerSidebar />
      </div>
      <div className="flex min-h-screen w-full flex-col lg:pl-63">
        <CustomerTopbar />
        <main className="mx-auto w-full max-w-310 flex-1 px-4 pt-5 pb-16 sm:px-8 sm:pt-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { DashboardTopbar } from "@/components/shared/dashboard-topbar";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";

export const AdminTopbar = function () {
  const router = useRouter();
  const { profile } = useGetProfile();

  return (
    <DashboardTopbar
      title={`${profile?.role === "SUPER_ADMIN" ? "Super admin" : "Admin"} dashboard`}
      searchPlaceholder="Search shipments by reference"
      onSearch={query => router.push(`/dashboard/admin/shipments?search=${encodeURIComponent(query)}`)}
      renderSidebar={onNavigate => <AdminSidebar className="w-full border-r-0" onNavigate={onNavigate} />}
    />
  );
};

"use client";

import { DashboardTopbar } from "@/components/shared/dashboard-topbar";
import { useGetProfile } from "@/hooks/use-get-profile";
import { AdminSidebar } from "./admin-sidebar";

export const AdminTopbar = function () {
  const { profile } = useGetProfile();

  return (
    <DashboardTopbar
      title={`${profile?.role === "SUPER_ADMIN" ? "Super admin" : "Admin"} dashboard`}
      renderSidebar={(onNavigate) => <AdminSidebar className="w-full border-r-0" onNavigate={onNavigate} />}
    />
  );
};

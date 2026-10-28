"use client";

import { DashboardTopbar } from "@/components/shared/dashboard-topbar";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { useRouter } from "next/navigation";
import { CustomerSidebar } from "./customer-sidebar";

export const CustomerTopbar = function () {
  const router = useRouter();

  return (
    <DashboardTopbar
      title="My shipping"
      searchPlaceholder="Track a shipment"
      onSearch={query => router.push(`/dashboard/customer/track?reference=${encodeURIComponent(query)}`)}
      actions={<NotificationsBell />}
      renderSidebar={onNavigate => <CustomerSidebar className="w-full border-r-0" onNavigate={onNavigate} />}
    />
  );
};

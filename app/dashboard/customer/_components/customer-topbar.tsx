"use client";

import { DashboardTopbar } from "@/components/shared/dashboard-topbar";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { CustomerSidebar } from "./customer-sidebar";

export const CustomerTopbar = function () {
  return <DashboardTopbar title="My shipping" actions={<NotificationsBell />} renderSidebar={onNavigate => <CustomerSidebar className="w-full border-r-0" onNavigate={onNavigate} />} />;
};

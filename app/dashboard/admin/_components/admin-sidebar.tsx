"use client";

import { DashboardSidebar, type DashboardNavGroup, type DashboardNavItem } from "@/components/shared/dashboard-sidebar";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { AdminQueues } from "@/types/admin";
import type { APIResponse } from "@/types/response";
import Cookies from "js-cookie";
import { Crown, History, Landmark, LayoutGrid, MessageSquareHeart, Package, Settings, ShieldCheck, UserRoundCog, Users } from "lucide-react";
import { useEffect, useState } from "react";

type AdminNavItem = DashboardNavItem & { superOnly?: boolean };

// Regular admins are operational staff: shipments + KYC only (owner decision).
const NAV_GROUPS: { label?: string; items: AdminNavItem[] }[] = [
  { items: [{ label: "Overview", href: "/dashboard/admin", icon: LayoutGrid, superOnly: true }] },
  {
    label: "Operations",
    items: [
      { label: "Shipments", href: "/dashboard/admin/shipments", icon: Package },
      { label: "KYC", href: "/dashboard/admin/kyc", icon: ShieldCheck },
    ],
  },
  {
    label: "Customers & money",
    items: [
      { label: "Users", href: "/dashboard/admin/users", icon: Users, superOnly: true },
      { label: "Payments", href: "/dashboard/admin/payments", icon: Landmark, superOnly: true },
      { label: "Surveys", href: "/dashboard/admin/surveys", icon: MessageSquareHeart, superOnly: true },
    ],
  },
  {
    label: "Team",
    items: [
      { label: "Admins", href: "/dashboard/admin/admins", icon: UserRoundCog, superOnly: true },
      { label: "Activity", href: "/dashboard/admin/activities", icon: History, superOnly: true },
      { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
    ],
  },
];

export const AdminSidebar = function ({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  // cookies don't exist during SSR — reading them in render mismatches hydration
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSuperAdmin(Cookies.get("session_type") === "SUPER_ADMIN");
  }, []);

  const { data } = useGetData<APIResponse<AdminQueues>>({ url: API_ENDPOINTS.admin.queues, staleTime: 60 * 1000 });
  const queues = data?.data;

  const counts: Record<string, number | undefined> = {
    "/dashboard/admin/shipments": queues ? queues.drop_offs.count + queues.payments.count : undefined,
    "/dashboard/admin/kyc": queues?.kyc.count,
  };

  const groups: DashboardNavGroup[] = NAV_GROUPS.map(group => ({
    label: group.label,
    items: group.items.filter(item => !item.superOnly || isSuperAdmin).map(item => ({ ...item, count: counts[item.href] })),
  })).filter(group => group.items.length > 0);

  const header = (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-muted px-2.5 py-1 text-[11.5px] font-bold text-brand-dark">
      {isSuperAdmin && <Crown className="size-3.5" />}
      {isSuperAdmin ? "Super admin" : "Admin"}
    </span>
  );

  return <DashboardSidebar groups={groups} homeHref={isSuperAdmin ? "/dashboard/admin" : "/dashboard/admin/shipments"} header={header} countTone="attention" className={className} onNavigate={onNavigate} />;
};

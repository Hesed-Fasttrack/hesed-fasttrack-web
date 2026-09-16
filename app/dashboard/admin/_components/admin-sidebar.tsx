"use client";

import { DashboardSidebar, type DashboardNavItem } from "@/components/shared/dashboard-sidebar";
import Cookies from "js-cookie";
import { Banknote, History, LayoutDashboard, Package, Settings, ShieldCheck, UserRoundCog, Users } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_ITEMS: (DashboardNavItem & { superOnly?: boolean })[] = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Shipments", href: "/dashboard/admin/shipments", icon: Package },
  { label: "KYC", href: "/dashboard/admin/kyc", icon: ShieldCheck },
  { label: "Withdrawals", href: "/dashboard/admin/withdrawals", icon: Banknote },
  { label: "Admins", href: "/dashboard/admin/admins", icon: UserRoundCog, superOnly: true },
  { label: "Activity", href: "/dashboard/admin/activities", icon: History, superOnly: true },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
];

export const AdminSidebar = function ({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  // cookies don't exist during SSR — reading them in render mismatches hydration
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSuperAdmin(Cookies.get("session_type") === "SUPER_ADMIN");
  }, []);

  const items = NAV_ITEMS.filter(item => !item.superOnly || isSuperAdmin);

  return <DashboardSidebar items={items} homeHref="/dashboard/admin" className={className} onNavigate={onNavigate} />;
};

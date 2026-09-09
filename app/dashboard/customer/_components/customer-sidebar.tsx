"use client";

import { DashboardSidebar, type DashboardNavItem } from "@/components/shared/dashboard-sidebar";
import { LayoutDashboard, MapPin, Package, PackagePlus, Settings, ShieldCheck, Wallet } from "lucide-react";

const NAV_ITEMS: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
  { label: "Book shipment", href: "/dashboard/customer/book", icon: PackagePlus },
  { label: "Shipments", href: "/dashboard/customer/shipments", icon: Package },
  { label: "Wallet", href: "/dashboard/customer/wallet", icon: Wallet },
  { label: "Addresses", href: "/dashboard/customer/addresses", icon: MapPin },
  { label: "Verification", href: "/dashboard/customer/kyc", icon: ShieldCheck },
  { label: "Settings", href: "/dashboard/customer/settings", icon: Settings },
];

export const CustomerSidebar = function ({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return <DashboardSidebar items={NAV_ITEMS} homeHref="/dashboard/customer" className={className} onNavigate={onNavigate} />;
};

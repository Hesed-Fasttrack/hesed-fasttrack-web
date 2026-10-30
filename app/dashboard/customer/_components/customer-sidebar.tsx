"use client";

import { DashboardSidebar, type DashboardNavGroup } from "@/components/shared/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { CustomerDashboardSummary } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { Calculator, LayoutGrid, MapPin, Package, Plus, Radar, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const CustomerSidebar = function ({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { data } = useGetData<APIResponse<CustomerDashboardSummary>>({ url: API_ENDPOINTS.customer.dashboard.summary, staleTime: 60 * 1000 });
  const summary = data?.data;
  const activeCount = summary ? summary.on_the_move + summary.awaiting_drop_off + summary.awaiting_pickup : undefined;

  const groups: DashboardNavGroup[] = [
    {
      items: [
        { label: "Overview", href: "/dashboard/customer", icon: LayoutGrid },
        { label: "Shipments", href: "/dashboard/customer/shipments", icon: Package, count: activeCount },
        { label: "Track", href: "/dashboard/customer/track", icon: Radar },
        { label: "Quick quote", href: "/dashboard/customer/quick-quote", icon: Calculator },
      ],
    },
    {
      label: "Account",
      items: [
        { label: "Addresses", href: "/dashboard/customer/addresses", icon: MapPin },
        { label: "Verification", href: "/dashboard/customer/kyc", icon: ShieldCheck },
        { label: "Settings", href: "/dashboard/customer/settings", icon: Settings },
      ],
    },
  ];

  const header = (
    <Button asChild className="h-10 w-full rounded-xl text-[13.5px]">
      <Link href="/dashboard/customer/book" onClick={onNavigate}>
        <Plus />
        Book a shipment
      </Link>
    </Button>
  );

  return <DashboardSidebar groups={groups} homeHref="/dashboard/customer" header={header} className={className} onNavigate={onNavigate} />;
};

"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { SHIPMENT_STATUS, type ShipmentStatus } from "@/lib/statuses";
import type { AdminStats } from "@/types/admin";
import type { APIResponse } from "@/types/response";
import { Banknote, Package, ShieldCheck, TrendingUp, Users, Wallet } from "lucide-react";

export default function AdminOverviewPage() {
  const { data, isFetching } = useGetData<APIResponse<AdminStats>>({ url: API_ENDPOINTS.admin.stats });
  const stats = data?.data;

  return (
    <div>
      <PageHeader title="Overview" description="How the platform is doing at a glance." />

      {isFetching && !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Customers" value={String(stats.customers.total)} hint={`${stats.customers.new_this_month} new this month`} icon={Users} />
            <StatCard label="Shipments" value={String(stats.shipments.total)} hint="All time" icon={Package} />
            <StatCard label="Revenue" value={formatNaira(stats.revenue.lifetime_minor)} hint={`${formatNaira(stats.revenue.this_month_minor)} this month`} icon={TrendingUp} />
            <StatCard label="Wallet liabilities" value={formatNaira(stats.wallets.total_balance_minor)} hint="Held in customer wallets" icon={Wallet} />
            <StatCard label="Pending KYC" value={String(stats.kyc.pending_review)} hint="Waiting for review" icon={ShieldCheck} />
            <StatCard label="Withdrawals" value="—" hint="See the withdrawals queue" icon={Banknote} />
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-white p-5">
            <p className="text-sm font-medium text-muted-foreground">Shipments by status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(stats.shipments.by_status).map(([status, count]) => {
                const presentation = SHIPMENT_STATUS[status as ShipmentStatus];
                if (!presentation) return null;
                return <StatusBadge key={status} label={`${presentation.label} · ${count}`} className={presentation.className} />;
              })}
              {Object.keys(stats.shipments.by_status).length === 0 && <p className="text-sm text-muted-foreground">No shipments yet.</p>}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

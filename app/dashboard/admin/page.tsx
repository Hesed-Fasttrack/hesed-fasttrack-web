"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminQueues, AdminStats, StatsRange } from "@/types/admin";
import type { APIResponse } from "@/types/response";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { Package, TrendingUp, Users, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AttentionCard } from "./_components/attention-card";
import { DailyShipmentsChart } from "./_components/daily-shipments-chart";
import { KpiCard } from "./_components/kpi-card";
import { LatestShipmentsCard } from "./_components/latest-shipments-card";
import { PipelineCard } from "./_components/pipeline-card";
import { TeamActivityCard } from "./_components/team-activity-card";

const RANGES: { value: StatsRange; label: string; caption: string; period: string }[] = [
  { value: "today", label: "Today", caption: "vs yesterday so far", period: "today" },
  { value: "7d", label: "7 days", caption: "vs previous 7 days", period: "this week" },
  { value: "30d", label: "30 days", caption: "vs previous 30 days", period: "this period" },
  { value: "year", label: "Year", caption: "vs same point last year", period: "this year" },
];

export default function AdminOverviewPage() {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [range, setRange] = useState<StatsRange>("30d");

  // Stats are confidential — regular admins land on their work queue instead.
  useEffect(() => {
    if (Cookies.get("session_type") !== "SUPER_ADMIN") {
      router.replace("/dashboard/admin/shipments");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSuperAdmin(true);
  }, [router]);

  const { data } = useGetData<APIResponse<AdminStats>>({ url: API_ENDPOINTS.admin.stats(range), shouldFetch: isSuperAdmin });
  const stats = data?.data?.range === range ? data.data : undefined;

  const { data: queuesData } = useGetData<APIResponse<AdminQueues>>({ url: API_ENDPOINTS.admin.queues, staleTime: 60 * 1000, shouldFetch: isSuperAdmin });
  const queues = queuesData?.data;

  if (!isSuperAdmin) return null;

  const active = RANGES.find(entry => entry.value === range) ?? RANGES[2];
  const waiting = queues ? queues.drop_offs.count + queues.kyc.count + (queues.withdrawals?.count ?? 0) + queues.courier_failures.count : null;

  return (
    <div>
      <PageHeader
        eyebrow={format(new Date(), "EEEE, d MMMM yyyy")}
        title="Business overview"
        description={waiting === null ? "How the business is doing at a glance." : waiting === 0 ? "Every queue is clear. Nothing needs a decision right now." : `${waiting} ${waiting === 1 ? "item needs" : "items need"} a decision. Everything else is moving.`}
        action={
          <div role="tablist" aria-label="Time range" className="inline-flex rounded-[10px] bg-surface-muted p-0.75">
            {RANGES.map(entry => (
              <button
                key={entry.value}
                type="button"
                role="tab"
                aria-selected={range === entry.value}
                onClick={() => setRange(entry.value)}
                className={cn("h-7.5 rounded-lg px-3 text-[12.5px] font-semibold transition-colors", range === entry.value ? "bg-white text-foreground shadow-xs" : "text-foreground-muted hover:text-foreground")}
              >
                {entry.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {!stats ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-34 rounded-2xl" />)
        ) : (
          <>
            <KpiCard label="Revenue" icon={TrendingUp} value={formatNaira(stats.revenue.current_minor)} comparison={{ current: stats.revenue.current_minor, previous: stats.revenue.previous_minor, caption: active.caption }} />
            <KpiCard label="Shipments booked" icon={Package} value={stats.shipments.current.toLocaleString()} comparison={{ current: stats.shipments.current, previous: stats.shipments.previous, caption: active.caption }} />
            <KpiCard label="Customers" icon={Users} value={stats.customers.total.toLocaleString()} hint={`${stats.customers.new_in_range.toLocaleString()} new ${active.period}`} />
            <KpiCard label="Wallet float" icon={Wallet} value={formatNaira(stats.wallets.total_balance_minor)} hint={`Held across ${stats.wallets.funded_count.toLocaleString()} funded wallets`} />
          </>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <DailyShipmentsChart daily={data?.data?.daily} />
        <AttentionCard queues={queues} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <LatestShipmentsCard />
        <div className="flex flex-col gap-5">
          <PipelineCard byStatus={data?.data?.shipments.by_status} />
          <TeamActivityCard />
        </div>
      </div>
    </div>
  );
}

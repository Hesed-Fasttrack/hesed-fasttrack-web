import { SectionCard } from "@/components/shared/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminQueues } from "@/types/admin";
import { formatDistanceToNowStrict } from "date-fns";
import { Banknote, ChevronRight, IdCard, PackageOpen, TriangleAlert, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface Row {
  title: string;
  detail: string;
  count: number;
  href: string;
  icon: LucideIcon;
  tone: string;
}

const waitingFor = (value: string | null) => (value ? `Oldest waiting ${formatDistanceToNowStrict(new Date(value))}` : "Nothing waiting");

export const AttentionCard = function ({ queues }: { queues: AdminQueues | undefined }) {
  const rows: Row[] = queues
    ? [
        { title: "Drop-offs to confirm", detail: waitingFor(queues.drop_offs.oldest_at), count: queues.drop_offs.count, href: "/dashboard/admin/shipments?status=PENDING_DROP_OFF", icon: PackageOpen, tone: "bg-amber/10 text-amber" },
        { title: "KYC to review", detail: waitingFor(queues.kyc.oldest_at), count: queues.kyc.count, href: "/dashboard/admin/kyc", icon: IdCard, tone: "bg-royal/10 text-royal" },
        ...(queues.withdrawals
          ? [{ title: "Withdrawals pending", detail: queues.withdrawals.count ? `${formatNaira(queues.withdrawals.total_minor)} total` : "Nothing waiting", count: queues.withdrawals.count, href: "/dashboard/admin/withdrawals", icon: Banknote, tone: "bg-brand-muted text-brand" }]
          : []),
        {
          title: "Courier dispatch failed",
          detail: queues.courier_failures.latest ? `Latest: ${queues.courier_failures.latest.reference}` : "All paid shipments dispatched",
          count: queues.courier_failures.count,
          href: queues.courier_failures.latest ? `/dashboard/admin/shipments/${queues.courier_failures.latest.id}` : "/dashboard/admin/shipments",
          icon: TriangleAlert,
          tone: "bg-danger/10 text-danger",
        },
      ]
    : [];

  return (
    <SectionCard title="Needs attention" description="Queues waiting on the team">
      {!queues ? (
        <div className="space-y-3 p-5.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map(row => (
            <li key={row.title}>
              <Link href={row.href} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-canvas sm:px-5.5">
                <span className={cn("flex size-9.5 shrink-0 items-center justify-center rounded-[10px]", row.count > 0 ? row.tone : "bg-surface-muted text-foreground-subtle")}>
                  <row.icon className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-foreground">{row.title}</p>
                  <p className="truncate text-[12.5px] text-foreground-muted">{row.detail}</p>
                </div>
                <span className={cn("text-lg font-extrabold tracking-tight tabular-nums", row.count > 0 ? "text-foreground" : "text-foreground-subtle")}>{row.count}</span>
                <ChevronRight className="size-4 shrink-0 text-foreground-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};

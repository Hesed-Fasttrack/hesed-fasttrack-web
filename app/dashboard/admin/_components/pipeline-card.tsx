import { SectionCard } from "@/components/shared/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { SHIPMENT_STATUS, type ShipmentStatus } from "@/lib/statuses";

const PIPELINE: { status: ShipmentStatus; fill: string }[] = [
  { status: "PENDING_DROP_OFF", fill: "bg-amber" },
  { status: "PENDING_PICKUP", fill: "bg-amber" },
  { status: "RECEIVED", fill: "bg-royal" },
  { status: "PICKED_UP", fill: "bg-royal" },
  { status: "IN_TRANSIT", fill: "bg-brand" },
  { status: "OUT_FOR_DELIVERY", fill: "bg-brand" },
  { status: "DELIVERED", fill: "bg-emerald" },
  { status: "CANCELLED", fill: "bg-line-strong" },
];

export const PipelineCard = function ({ byStatus }: { byStatus: Partial<Record<ShipmentStatus, number>> | undefined }) {
  const max = Math.max(1, ...Object.values(byStatus ?? {}).map(count => count ?? 0));

  return (
    <SectionCard title="Pipeline by status" description="Every shipment, all time">
      <div className="px-5 pt-2 pb-4.5 sm:px-5.5">
        {!byStatus
          ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="my-2.5 h-4 rounded-full" />)
          : PIPELINE.map(({ status, fill }) => {
              const count = byStatus[status] ?? 0;
              return (
                <div key={status} className="grid grid-cols-[minmax(0,7.5rem)_1fr_2.5rem] items-center gap-3 py-1.75 text-[13px]">
                  <span className="truncate text-foreground">{SHIPMENT_STATUS[status].label}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div className={`h-full rounded-full ${fill}`} style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="text-right font-bold text-foreground tabular-nums">{count}</span>
                </div>
              );
            })}
      </div>
    </SectionCard>
  );
};

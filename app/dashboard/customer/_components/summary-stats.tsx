import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CustomerDashboardSummary } from "@/types/customer";
import { format } from "date-fns";
import { CircleCheck, Clock, Receipt, Truck, type LucideIcon } from "lucide-react";

const Stat = function ({ icon: Icon, label, value, hint, className }: { icon: LucideIcon; label: string; value: string; hint?: string; className?: string }) {
  return (
    <div className={cn("min-w-0 border-line px-5 py-4.5 sm:px-5.5", className)}>
      <p className="flex items-center gap-1.75 text-[12.5px] text-foreground-muted">
        <Icon className="size-3.75 shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 text-[22px] font-bold tracking-tight text-foreground tabular-nums">
        <span className="truncate">{value}</span>
        {hint && <span className="text-xs font-medium tracking-normal text-foreground-muted">{hint}</span>}
      </p>
    </div>
  );
};

export const SummaryStats = function ({ summary }: { summary: CustomerDashboardSummary | undefined }) {
  const waiting = summary ? summary.awaiting_drop_off + summary.awaiting_pickup : 0;
  const waitingHint = !summary || waiting === 0 ? undefined : summary.awaiting_payment > 0 ? "to pay" : summary.awaiting_drop_off > 0 ? "bring to the office" : "awaiting pickup";

  return (
    <section className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-white lg:grid-cols-4">
      <Stat className="border-r border-b lg:border-b-0" icon={Truck} label="On the move" value={summary ? String(summary.on_the_move) : "-"} />
      <Stat className="border-b lg:border-r lg:border-b-0" icon={CircleCheck} label="Delivered this year" value={summary ? String(summary.delivered_this_year) : "-"} />
      <Stat className="border-r" icon={Receipt} label={`Spent in ${format(new Date(), "MMMM")}`} value={summary ? formatNaira(summary.spent_this_month_minor) : "-"} />
      <Stat icon={Clock} label="Waiting on you" value={summary ? String(waiting) : "-"} hint={waitingHint} />
    </section>
  );
};

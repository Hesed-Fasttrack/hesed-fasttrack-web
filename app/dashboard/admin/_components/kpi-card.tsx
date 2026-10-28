import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  comparison?: { current: number; previous: number; caption: string };
  hint?: string;
}

export const KpiCard = function ({ label, value, icon: Icon, comparison, hint }: Props) {
  const change = comparison && comparison.previous > 0 ? ((comparison.current - comparison.previous) / comparison.previous) * 100 : null;
  const isUp = change !== null && change >= 0;

  return (
    <section className="min-w-0 rounded-2xl border border-line bg-white p-5 sm:p-5.5">
      <div className="flex items-center justify-between gap-2 text-[13px] font-medium text-foreground-muted">
        <span className="truncate">{label}</span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-brand-muted text-brand">
          <Icon className="size-3.75" />
        </span>
      </div>
      <p className="mt-2.5 truncate text-[22px] font-extrabold tracking-tight text-foreground tabular-nums sm:text-[26px]">{value}</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[12.5px] text-foreground-muted">
        {comparison ? (
          change === null ? (
            <span>No earlier data to compare</span>
          ) : (
            <>
              <span className={cn("inline-flex items-center gap-0.5 font-bold", isUp ? "text-emerald" : "text-danger")}>
                {isUp ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {Math.abs(change).toFixed(1)}%
              </span>
              {comparison.caption}
            </>
          )
        ) : (
          hint
        )}
      </p>
    </section>
  );
};

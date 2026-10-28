import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

export const StatCard = function ({ label, value, hint, icon: Icon }: Props) {
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-white p-5 sm:p-5.5">
      <div className="flex items-center justify-between gap-2 text-[13px] font-medium text-foreground-muted">
        <span className="truncate">{label}</span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-brand-muted text-brand">
          <Icon className="size-3.75" />
        </span>
      </div>
      <p className="mt-2.5 truncate text-[22px] font-extrabold tracking-tight text-foreground tabular-nums sm:text-[26px]">{value}</p>
      {hint && <p className="mt-1 text-[12.5px] text-foreground-muted">{hint}</p>}
    </section>
  );
};

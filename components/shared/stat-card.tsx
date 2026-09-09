import { AppText } from "@/components/shared/app-text";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

export const StatCard = function ({ label, value, hint, icon: Icon }: Props) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted">
          <Icon className="h-4.5 w-4.5 text-brand" />
        </div>
      </div>
      <AppText type="h2" className="mt-3">
        {value}
      </AppText>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};

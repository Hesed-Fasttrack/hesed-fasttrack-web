import { cn } from "@/lib/utils";

interface Props {
  label: string;
  className: string;
}

export const StatusBadge = function ({ label, className }: Props) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", className)}>{label}</span>;
};

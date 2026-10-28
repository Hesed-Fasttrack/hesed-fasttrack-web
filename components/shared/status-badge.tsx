import { cn } from "@/lib/utils";

interface Props {
  label: string;
  className: string;
}

export const StatusBadge = function ({ label, className }: Props) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap before:size-1.5 before:shrink-0 before:rounded-full before:bg-current", className)}>{label}</span>
  );
};

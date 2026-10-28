import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const RouteText = function ({ from, to, className }: { from: string; to: string; className?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2 font-medium text-foreground", className)}>
      <span className="truncate">{from}</span>
      <ArrowRight className="size-3.5 shrink-0 text-foreground-subtle" />
      <span className="truncate">{to}</span>
    </span>
  );
};

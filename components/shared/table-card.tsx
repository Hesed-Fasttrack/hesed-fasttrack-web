import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const TableCard = function ({ title, description, toolbar, footer, className, children }: Props) {
  const hasHeader = !!(title || toolbar);

  return (
    <section className={cn("overflow-hidden rounded-2xl border border-line bg-white", className)}>
      {hasHeader && (
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:px-5.5 md:flex-row md:items-center md:justify-between">
          {title && (
            <div className="min-w-0">
              <p className="text-[15px] font-bold tracking-tight text-foreground">{title}</p>
              {description && <p className="mt-0.5 text-[12.5px] text-foreground-muted">{description}</p>}
            </div>
          )}
          {toolbar && <div className={cn("flex flex-col gap-2.5 sm:flex-row sm:items-center", !title && "w-full")}>{toolbar}</div>}
        </div>
      )}
      {children}
      {footer}
    </section>
  );
};

export const TableSearch = function ({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <label className={cn("flex h-10 w-full items-center gap-2.5 rounded-xl border border-line bg-canvas px-3 transition-colors focus-within:border-brand focus-within:bg-white focus-within:ring-3 focus-within:ring-brand-muted sm:w-72", className)}>
      <Search className="size-4 shrink-0 text-foreground-subtle" />
      <input type="search" className="min-w-0 flex-1 bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-foreground-subtle" {...props} />
    </label>
  );
};

export const TOOLBAR_SELECT_CLASS = "h-10 rounded-xl border-line bg-white shadow-none";

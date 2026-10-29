import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Inbox, type LucideIcon } from "lucide-react";

export const TableSkeletonRows = function ({ rows = 5, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-4 w-full max-w-32" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  compact?: boolean;
}

export const EmptyState = function ({ title, message, icon: Icon = Inbox, action, compact }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 text-center whitespace-normal", compact ? "py-9" : "py-14")}>
      <span className={cn("flex items-center justify-center rounded-2xl bg-brand-muted", compact ? "size-10" : "size-12")}>
        <Icon className={cn("text-brand", compact ? "size-4.5" : "size-5.5")} />
      </span>
      {title && <p className="mt-4 text-[15px] font-bold tracking-tight text-foreground">{title}</p>}
      <p className={cn("max-w-sm text-[13.5px] leading-relaxed text-foreground-muted", title ? "mt-1" : "mt-3.5")}>{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export const TableEmptyRow = function ({ columns, ...props }: EmptyStateProps & { columns: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columns} className="p-0">
        <EmptyState {...props} />
      </TableCell>
    </TableRow>
  );
};

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls = function ({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-5.5">
      <p className="text-[12.5px] text-foreground-muted tabular-nums">
        Page {page} of {totalPages} · {total.toLocaleString()} total
      </p>
      <div className="flex gap-1.5">
        <Button variant="outline" size="icon-sm" className="rounded-lg" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon-sm" className="rounded-lg" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};

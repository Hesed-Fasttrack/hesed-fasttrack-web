import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
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

export const EmptyState = function ({ message, icon: Icon = Inbox, action }: { message: string; icon?: LucideIcon; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-surface-muted">
        <Icon className="size-5 text-foreground-subtle" />
      </span>
      <p className="max-w-sm text-sm whitespace-normal text-foreground-muted">{message}</p>
      {action}
    </div>
  );
};

export const TableEmptyRow = function ({ columns, message, icon }: { columns: number; message: string; icon?: LucideIcon }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columns} className="p-0">
        <EmptyState message={message} icon={icon} />
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

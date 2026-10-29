import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X, type LucideIcon } from "lucide-react";

const SIZES = {
  sm: "sm:max-w-[420px]",
  md: "sm:max-w-[500px]",
  lg: "sm:max-w-[620px]",
};

const TONES = {
  brand: "bg-brand-muted text-brand",
  danger: "bg-danger/10 text-danger",
  emerald: "bg-emerald/10 text-emerald",
};

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: keyof typeof TONES;
  size?: keyof typeof SIZES;
  dialogFooter?: React.ReactNode;
  width?: string;
  height?: string;
  isSubmitting?: boolean;
}

export const AppDialog = function ({ isOpen, onOpenChange, children, title, description, icon: Icon, tone = "brand", size = "md", dialogFooter, width, height, isSubmitting }: Props) {
  const handleOpenChange = (open: boolean) => {
    if (!open && isSubmitting) return; // block close while request is in flight
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn("flex max-h-[88dvh] flex-col gap-0 overflow-hidden rounded-2xl border border-line bg-white p-0 shadow-[0_24px_60px_rgba(17,17,20,0.18)] ring-0", SIZES[size])}
        style={width || height ? { width, maxWidth: "100vw", maxHeight: height } : undefined}
        onInteractOutside={e => {
          if (isSubmitting) e.preventDefault();
        }}
        onEscapeKeyDown={e => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader className={cn("shrink-0 flex-row gap-3.5 px-5.5 py-4.5 sm:px-6", description ? "items-start" : "items-center", children && "border-b border-line")}>
          {Icon && (
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", TONES[tone])}>
              <Icon className="size-4.5" />
            </span>
          )}
          <div className={cn("min-w-0 flex-1", description && "pt-0.5")}>
            <DialogTitle className="text-[17px] leading-snug font-bold tracking-tight text-foreground">{title}</DialogTitle>
            {description && <DialogDescription className="mt-1 text-[13px] leading-relaxed text-foreground-muted">{description}</DialogDescription>}
          </div>
          <DialogClose
            disabled={isSubmitting}
            aria-label="Close"
            className="-mt-0.5 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-foreground-muted transition-colors outline-none hover:border-line-strong hover:text-foreground focus-visible:border-brand focus-visible:text-foreground disabled:opacity-50"
          >
            <X className="size-4" />
          </DialogClose>
        </DialogHeader>

        {children && <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5.5 py-5 sm:px-6">{children}</div>}

        {/* ui/dialog's footer bakes in -mx-4 -mb-4 for the default p-4 content — neutralise it, we run p-0 */}
        {dialogFooter && (
          <DialogFooter className="mx-0 mb-0 shrink-0 gap-2.5 rounded-none border-t border-line bg-canvas px-5.5 py-4 sm:px-6 [&_[data-slot=button]]:h-10 [&_[data-slot=button]]:rounded-xl [&_[data-slot=button]]:px-4.5">
            {dialogFooter}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

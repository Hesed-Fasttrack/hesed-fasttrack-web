import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  description?: string;
  dialogFooter?: React.ReactNode;
  width?: string;
  height?: string;
  isSubmitting?: boolean;
}

export const AppDialog = function ({ isOpen, onOpenChange, children, title, description, dialogFooter, width, height, isSubmitting }: Props) {
  const handleOpenChange = (open: boolean) => {
    if (!open && isSubmitting) return; // block close while request is in flight
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex flex-col gap-0 p-0"
        style={width || height ? { width, maxWidth: "100vw", maxHeight: height } : undefined}
        onInteractOutside={e => {
          if (isSubmitting) e.preventDefault();
        }}
        onEscapeKeyDown={e => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="scrollbar-hide max-h-[80vh] overflow-y-auto px-6 py-4">{children}</div>

        {/* ui/dialog's footer bakes in -mx-4 -mb-4 for the default p-4 content — neutralise it, we run p-0 */}
        {dialogFooter && <DialogFooter className="mx-0 mb-0 border-t px-6 py-4">{dialogFooter}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

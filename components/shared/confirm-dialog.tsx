"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = function ({ open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", isDestructive, isLoading, onConfirm, onCancel }: Props) {
  return (
    <AppDialog
      isOpen={open}
      onOpenChange={isOpen => !isOpen && onCancel()}
      title={title}
      isSubmitting={isLoading}
      dialogFooter={
        <>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={isDestructive ? "destructive" : "default"} onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{description}</p>
    </AppDialog>
  );
};

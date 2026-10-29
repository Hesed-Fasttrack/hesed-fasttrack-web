"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { CircleHelp, Loader2, TriangleAlert, type LucideIcon } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = function ({ open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", isDestructive, isLoading, icon, onConfirm, onCancel }: Props) {
  return (
    <AppDialog
      isOpen={open}
      onOpenChange={isOpen => !isOpen && onCancel()}
      title={title}
      description={description}
      icon={icon ?? (isDestructive ? TriangleAlert : CircleHelp)}
      tone={isDestructive ? "danger" : "brand"}
      size="sm"
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
    />
  );
};

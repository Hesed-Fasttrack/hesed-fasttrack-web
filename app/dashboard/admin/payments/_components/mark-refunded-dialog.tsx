"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { displayName, type AdminPaymentRow } from "@/types/admin";
import { Loader2, Undo2 } from "lucide-react";
import { useState } from "react";

interface Props {
  payment: AdminPaymentRow | null;
  onClose: () => void;
}

export const MarkRefundedDialog = function ({ payment, onClose }: Props) {
  const [note, setNote] = useState("");

  const handleClose = function () {
    setNote("");
    onClose();
  };

  const { mutate: markRefunded, isPending } = useSubmitData<{ note: string }, unknown>({
    url: API_ENDPOINTS.admin.payments.markRefunded(payment?.id ?? ""),
    onSuccessMessage: "Refund recorded. The customer has been notified",
    onSuccess: handleClose,
  });

  return (
    <AppDialog
      isOpen={!!payment}
      onOpenChange={isOpen => !isOpen && handleClose()}
      title="Record the refund"
      icon={Undo2}
      description={payment ? `Send ${formatNaira(payment.amount_minor)} back to ${displayName(payment.user)} by bank transfer first, then record it here for the audit trail.` : undefined}
      isSubmitting={isPending}
      dialogFooter={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={() => markRefunded({ note: note.trim() })} disabled={isPending || note.trim().length < 5}>
            {isPending && <Loader2 className="animate-spin" />}
            Mark as refunded
          </Button>
        </>
      }
    >
      <Textarea placeholder="Transfer reference, bank and anything else worth keeping" value={note} onChange={event => setNote(event.target.value)} maxLength={300} />
    </AppDialog>
  );
};

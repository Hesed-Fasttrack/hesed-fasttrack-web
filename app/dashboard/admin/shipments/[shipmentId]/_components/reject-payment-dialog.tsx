"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Loader2, ReceiptText } from "lucide-react";
import { useState } from "react";

interface Props {
  shipmentId: string;
  paymentId: string | null;
  onClose: () => void;
}

export const RejectPaymentDialog = function ({ shipmentId, paymentId, onClose }: Props) {
  const [reason, setReason] = useState("");

  const handleClose = function () {
    setReason("");
    onClose();
  };

  const { mutate: review, isPending } = useSubmitData<{ decision: "REJECT"; reason: string }, unknown>({
    url: API_ENDPOINTS.admin.shipments.reviewPayment(shipmentId, paymentId ?? ""),
    onSuccessMessage: "Payment rejected. The customer has been asked for a new receipt",
    additionalQueryKeys: [[API_ENDPOINTS.admin.shipments.detail(shipmentId)], [API_ENDPOINTS.admin.queues]],
    onSuccess: handleClose,
  });

  const isValid = reason.trim().length >= 5;

  return (
    <AppDialog
      isOpen={!!paymentId}
      onOpenChange={isOpen => !isOpen && handleClose()}
      title="Reject this payment?"
      icon={ReceiptText}
      tone="danger"
      description="The shipment goes back to unpaid and the customer is asked to upload a new receipt. Your reason is shown to them."
      isSubmitting={isPending}
      dialogFooter={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => review({ decision: "REJECT", reason: reason.trim() })} disabled={isPending || !isValid}>
            {isPending && <Loader2 className="animate-spin" />}
            Reject payment
          </Button>
        </>
      }
    >
      <Textarea placeholder="e.g. The amount on the receipt doesn't match, or the transfer hasn't arrived" value={reason} onChange={event => setReason(event.target.value)} maxLength={300} />
    </AppDialog>
  );
};

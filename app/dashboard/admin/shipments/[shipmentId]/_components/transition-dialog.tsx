"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { NEXT_SHIPMENT_STATUSES, SHIPMENT_STATUS } from "@/lib/statuses";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  shipmentId: string;
  currentStatus: string;
  open: boolean;
  onClose: () => void;
}

export const TransitionDialog = function ({ shipmentId, currentStatus, open, onClose }: Props) {
  const [status, setStatus] = useState<string>("");
  const [note, setNote] = useState("");

  const { mutate: transition, isPending } = useSubmitData<{ status: string; note?: string }, unknown>({
    url: API_ENDPOINTS.admin.shipments.transition(shipmentId),
    onSuccessMessage: "Shipment status updated",
    additionalQueryKeys: [[API_ENDPOINTS.admin.shipments.detail(shipmentId)]],
    onSuccess: () => {
      setStatus("");
      setNote("");
      onClose();
    },
  });

  return (
    <AppDialog
      isOpen={open}
      onOpenChange={isOpen => !isOpen && onClose()}
      title="Update shipment status"
      description="The status machine validates the move, records the event, refunds cancelled paid shipments and notifies the customer."
      isSubmitting={isPending}
      dialogFooter={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={() => transition({ status, note: note.trim() || undefined })} disabled={isPending || !status}>
            {isPending && <Loader2 className="animate-spin" />}
            Update status
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <AppSimpleSelect placeholder="New status" value={status} onValueChange={setStatus} options={(NEXT_SHIPMENT_STATUSES[currentStatus] ?? []).map(value => ({ label: SHIPMENT_STATUS[value as keyof typeof SHIPMENT_STATUS].label, value }))} />

        <Textarea placeholder="Optional note shown on the customer's tracking timeline" value={note} onChange={event => setNote(event.target.value)} maxLength={300} />
      </div>
    </AppDialog>
  );
};

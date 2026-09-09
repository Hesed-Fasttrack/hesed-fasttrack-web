"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { SHIPMENT_STATUS, SHIPMENT_TRANSITIONS } from "@/lib/statuses";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  shipmentId: string;
  open: boolean;
  onClose: () => void;
}

export const TransitionDialog = function ({ shipmentId, open, onClose }: Props) {
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
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update shipment status</DialogTitle>
          <DialogDescription>The status machine validates the move, records the event, refunds cancelled paid shipments and notifies the customer.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="New status" />
            </SelectTrigger>
            <SelectContent>
              {SHIPMENT_TRANSITIONS.map(value => (
                <SelectItem key={value} value={value}>
                  {SHIPMENT_STATUS[value].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea placeholder="Optional note shown on the customer's tracking timeline" value={note} onChange={event => setNote(event.target.value)} maxLength={300} />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={() => transition({ status, note: note.trim() || undefined })} disabled={isPending || !status}>
            {isPending && <Loader2 className="animate-spin" />}
            Update status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { KYC_STATUS, type KycStatus } from "@/lib/statuses";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Props {
  submissionId: string;
  document: "identity" | "address";
  title: string;
  imageUrl: string;
  status: KycStatus;
  rejectionReason: string | null;
}

export const KycDocumentCard = function ({ submissionId, document, title, imageUrl, status, rejectionReason }: Props) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { mutate: review, isPending } = useSubmitData<{ identity?: object; address?: object }, unknown>({
    url: API_ENDPOINTS.admin.kyc.review(submissionId),
    onSuccessMessage: "Decision recorded",
    additionalQueryKeys: [[API_ENDPOINTS.admin.kyc.detail(submissionId)], [API_ENDPOINTS.admin.kyc.list("?page=1&limit=10&status=PENDING")]],
    onSuccess: () => {
      setIsRejectOpen(false);
      setReason("");
    },
  });

  const presentation = KYC_STATUS[status];

  const handleReject = function () {
    if (reason.trim().length < 5) return showToast("warning", "Give the customer an actionable reason");
    review({ [document]: { decision: "REJECT", reason: reason.trim() } });
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <StatusBadge label={presentation.label} className={presentation.className} />
      </div>

      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="relative mt-4 block h-64 overflow-hidden rounded-xl border border-line bg-canvas">
        <Image src={imageUrl} alt={title} fill unoptimized className="object-contain" />
      </a>

      {rejectionReason && <p className="mt-3 rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">{rejectionReason}</p>}

      {status === "PENDING" && (
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" disabled={isPending} onClick={() => review({ [document]: { decision: "APPROVE" } })}>
            {isPending && <Loader2 className="animate-spin" />}
            Approve
          </Button>
          <Button variant="destructive" className="flex-1" disabled={isPending} onClick={() => setIsRejectOpen(true)}>
            Reject
          </Button>
        </div>
      )}

      <Dialog open={isRejectOpen} onOpenChange={isOpen => !isOpen && setIsRejectOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject {title.toLowerCase()}</DialogTitle>
            <DialogDescription>The reason is shown to the customer so they can fix and resubmit.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="e.g. The photo is blurry — retake it with all corners visible." value={reason} onChange={event => setReason(event.target.value)} maxLength={300} />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Reject document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

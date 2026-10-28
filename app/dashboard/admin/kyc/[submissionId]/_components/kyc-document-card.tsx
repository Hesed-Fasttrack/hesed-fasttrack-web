"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { KYC_STATUS, type KycStatus } from "@/lib/statuses";
import { Loader2, TriangleAlert } from "lucide-react";
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
    <SectionCard title={title} action={<StatusBadge label={presentation.label} className={presentation.className} />}>
      <div className="p-5 sm:p-5.5">
        <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="relative block h-56 overflow-hidden rounded-xl border border-line bg-canvas sm:h-72">
          <Image src={imageUrl} alt={title} fill unoptimized className="object-contain" />
        </a>

        {rejectionReason && (
          <div className="mt-3 flex gap-2.5 rounded-xl bg-danger/10 px-3.5 py-3 text-[13px] text-danger">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <p className="min-w-0 break-words">{rejectionReason}</p>
          </div>
        )}

        {status === "PENDING" && (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Button className="h-10 rounded-xl" disabled={isPending} onClick={() => review({ [document]: { decision: "APPROVE" } })}>
              {isPending && <Loader2 className="animate-spin" />}
              Approve
            </Button>
            <Button variant="destructive" className="h-10 rounded-xl" disabled={isPending} onClick={() => setIsRejectOpen(true)}>
              Reject
            </Button>
          </div>
        )}
      </div>

      <AppDialog
        isOpen={isRejectOpen}
        onOpenChange={isOpen => !isOpen && setIsRejectOpen(false)}
        title={`Reject ${title.toLowerCase()}`}
        description="The reason is shown to the customer so they can fix and resubmit."
        isSubmitting={isPending}
        dialogFooter={
          <>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Reject document
            </Button>
          </>
        }
      >
        <Textarea placeholder="e.g. The photo is blurry. Retake it with all corners visible." value={reason} onChange={event => setReason(event.target.value)} maxLength={300} />
      </AppDialog>
    </SectionCard>
  );
};

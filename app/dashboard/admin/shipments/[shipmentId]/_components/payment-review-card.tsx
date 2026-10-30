"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime, formatNaira } from "@/lib/format";
import { PAYMENT_PROOF_STATUS } from "@/lib/statuses";
import { displayName, type AdminShipment, type AdminShipmentPayment } from "@/types/admin";
import { BadgeCheck, ExternalLink, FileText } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { RejectPaymentDialog } from "./reject-payment-dialog";

const isPdf = (url: string) => url.toLowerCase().split("?")[0].endsWith(".pdf");

const Verdict = function ({ payment }: { payment: AdminShipmentPayment }) {
  if (payment.status === "PENDING") return null;

  const reviewer = payment.reviewedBy ? displayName(payment.reviewedBy) : "an admin";

  return (
    <div className="mt-2 space-y-1 text-[12.5px] text-foreground-muted">
      <p>
        {payment.status === "REJECTED" ? "Rejected" : "Approved"} by <span className="font-medium text-foreground">{reviewer}</span>
        {payment.reviewedAt ? ` · ${formatDateTime(payment.reviewedAt)}` : ""}
      </p>
      {payment.rejection_reason && <p className="text-danger">{payment.rejection_reason}</p>}
      {payment.status === "REFUNDED" && (
        <p>
          Refunded by <span className="font-medium text-foreground">{payment.refundedBy ? displayName(payment.refundedBy) : "an admin"}</span>
          {payment.refundedAt ? ` · ${formatDateTime(payment.refundedAt)}` : ""}
          {payment.refund_note ? `: ${payment.refund_note}` : ""}
        </p>
      )}
    </div>
  );
};

export const PaymentReviewCard = function ({ shipment }: { shipment: AdminShipment }) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const payments = shipment.payments ?? [];

  const { mutate: approve, isPending: isApproving } = useSubmitData<{ decision: "APPROVE" }, unknown>({
    url: API_ENDPOINTS.admin.shipments.reviewPayment(shipment.id, approvingId ?? ""),
    onSuccessMessage: "Payment approved. The shipment is now paid",
    additionalQueryKeys: [[API_ENDPOINTS.admin.shipments.detail(shipment.id)], [API_ENDPOINTS.admin.queues]],
    onSuccess: () => setApprovingId(null),
  });

  const description =
    shipment.payment_status === "AWAITING_CONFIRMATION"
      ? "Check the receipt against the bank statement before approving"
      : shipment.payment_status === "UNPAID"
        ? "Waiting for the customer's bank transfer"
        : "Direct bank transfer";

  return (
    <SectionCard title="Payment" description={description}>
      {payments.length === 0 ? (
        <p className="p-5 text-[13px] text-foreground-muted sm:p-5.5">No receipt uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {payments.map(payment => {
            const status = PAYMENT_PROOF_STATUS[payment.status];
            const isPending = payment.status === "PENDING";
            return (
              <li key={payment.id} className="px-5 py-4 sm:px-5.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-foreground tabular-nums">{formatNaira(payment.amount_minor)}</p>
                    <p className="text-xs text-foreground-subtle">
                      Sent {formatDateTime(payment.createdAt)}
                      {payment.payer_name ? ` · paid by ${payment.payer_name}` : ""}
                    </p>
                  </div>
                  <StatusBadge label={status.label} className={status.className} />
                </div>

                {isPdf(payment.proof_url) ? (
                  <a href={payment.proof_url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-2.5 rounded-xl border border-line bg-canvas px-3.5 py-3 text-[13px] font-medium text-brand hover:border-brand/40">
                    <FileText className="size-4" />
                    Open PDF receipt
                    <ExternalLink className="ml-auto size-3.5" />
                  </a>
                ) : (
                  <a href={payment.proof_url} target="_blank" rel="noopener noreferrer" className="group relative mt-3 block overflow-hidden rounded-xl border border-line bg-canvas">
                    <Image src={payment.proof_url} alt="Transfer receipt" width={480} height={320} unoptimized className="max-h-64 w-full object-contain" />
                    <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[11.5px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      Open full size
                      <ExternalLink className="size-3" />
                    </span>
                  </a>
                )}

                {payment.note && <p className="mt-2 text-[12.5px] text-foreground-muted">&ldquo;{payment.note}&rdquo;</p>}

                <Verdict payment={payment} />

                {isPending && (
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <Button variant="outline" className="h-10 rounded-xl text-danger hover:text-danger" onClick={() => setRejectingId(payment.id)}>
                      Reject
                    </Button>
                    <Button className="h-10 rounded-xl" onClick={() => setApprovingId(payment.id)}>
                      <BadgeCheck />
                      Approve
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!approvingId}
        title="Approve this payment?"
        description={`Only approve once ${formatNaira(shipment.amount_minor)} has landed in the company account. The shipment is marked paid and ${shipment.fulfilment_type === "PICKUP" ? "pickup can be arranged" : "it can be shipped"}.`}
        confirmLabel="Approve payment"
        icon={BadgeCheck}
        isLoading={isApproving}
        onConfirm={() => approve({ decision: "APPROVE" })}
        onCancel={() => setApprovingId(null)}
      />
      <RejectPaymentDialog shipmentId={shipment.id} paymentId={rejectingId} onClose={() => setRejectingId(null)} />
    </SectionCard>
  );
};

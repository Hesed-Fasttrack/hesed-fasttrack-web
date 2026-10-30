import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatNaira } from "@/lib/format";
import { PAYMENT_PROOF_STATUS } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import type { CustomerShipment } from "@/types/customer";
import { ExternalLink } from "lucide-react";

const Note = function ({ tone, children }: { tone: "brand" | "royal" | "emerald" | "danger" | "muted"; children: React.ReactNode }) {
  const tones = {
    brand: "bg-brand-muted/60 text-foreground",
    royal: "bg-royal/10 text-royal",
    emerald: "bg-emerald/10 text-emerald",
    danger: "bg-danger/10 text-danger",
    muted: "bg-surface-muted text-foreground-muted",
  };
  return <p className={cn("rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed", tones[tone])}>{children}</p>;
};

interface Props {
  shipment: CustomerShipment;
  isPayable: boolean;
  onPay: () => void;
}

export const PaymentCard = function ({ shipment, isPayable, onPay }: Props) {
  const payments = shipment.payments ?? [];
  const latest = payments[0];
  const approved = payments.find(payment => payment.status === "APPROVED" || payment.status === "REFUNDED");

  const renderState = function () {
    if (isPayable) {
      return (
        <>
          {latest?.status === "REJECTED" ? (
            <Note tone="danger">We couldn&apos;t confirm your last transfer: {latest.rejection_reason}. Upload a new receipt to continue.</Note>
          ) : (
            <Note tone="brand">Pay {formatNaira(shipment.amount_minor)} by bank transfer, then upload your receipt. We&apos;ll confirm it and get your shipment moving.</Note>
          )}
          <Button className="h-10 w-full rounded-xl" onClick={onPay}>
            {latest?.status === "REJECTED" ? "Upload a new receipt" : "Pay by bank transfer"}
          </Button>
        </>
      );
    }

    switch (shipment.payment_status) {
      case "AWAITING_CONFIRMATION":
        return <Note tone="royal">We&apos;re checking your transfer and will let you know as soon as it&apos;s confirmed.</Note>;
      case "PAID":
        return <Note tone="emerald">Payment confirmed{approved?.reviewedAt ? ` on ${formatDateTime(approved.reviewedAt)}` : ""}.</Note>;
      case "REFUND_DUE":
        return <Note tone="danger">This shipment was cancelled after payment. We&apos;ll refund {formatNaira(shipment.amount_minor)} to you by bank transfer.</Note>;
      case "REFUNDED":
        return <Note tone="muted">Refunded{approved?.refundedAt ? ` on ${formatDateTime(approved.refundedAt)}` : ""}.</Note>;
      default:
        if (shipment.status === "CANCELLED") return <Note tone="muted">No payment was made for this shipment.</Note>;
        return <Note tone="muted">You&apos;ll pay by bank transfer once we&apos;ve received and verified your parcel at the office.</Note>;
    }
  };

  return (
    <SectionCard title="Payment" description="Direct bank transfer">
      <div className="space-y-3 p-5 sm:p-5.5">{renderState()}</div>

      {payments.length > 0 && (
        <ul className="divide-y divide-line border-t border-line">
          {payments.map(payment => {
            const status = PAYMENT_PROOF_STATUS[payment.status];
            return (
              <li key={payment.id} className="flex items-center justify-between gap-3 px-5 py-3 sm:px-5.5">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground tabular-nums">{formatNaira(payment.amount_minor)}</p>
                  <p className="text-xs text-foreground-subtle">Sent {formatDateTime(payment.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge label={status.label} className={status.className} />
                  <a href={payment.proof_url} target="_blank" rel="noreferrer" aria-label="View receipt" className="flex size-7 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-surface-muted hover:text-foreground">
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
};

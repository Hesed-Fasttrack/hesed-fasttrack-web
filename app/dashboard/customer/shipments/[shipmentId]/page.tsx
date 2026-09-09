"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatDateTime, formatNaira } from "@/lib/format";
import { PAYMENT_STATUS, SHIPMENT_STATUS } from "@/lib/statuses";
import type { CustomerKycSubmission, CustomerShipment, CustomerShipmentEvent, Wallet } from "@/types/customer";
import { SHIPMENT_PURPOSES } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const InfoRow = function ({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
};

export default function CustomerShipmentDetailPage() {
  const { shipmentId = "" } = useParams<{ shipmentId: string }>();
  const router = useRouter();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const trackingUrl = API_ENDPOINTS.customer.shipments.tracking(shipmentId);
  const { data, isFetching } = useGetData<APIResponse<{ shipment: CustomerShipment; events: CustomerShipmentEvent[] }>>({ url: trackingUrl });
  const shipment = data?.data?.shipment;
  const events = data?.data?.events ?? [];

  const isAwaitingPayment = shipment?.status === "RECEIVED" && shipment.payment_status === "UNPAID";

  const { data: walletData } = useGetData<APIResponse<Wallet>>({ url: API_ENDPOINTS.customer.wallet.balance, shouldFetch: isAwaitingPayment });
  const { data: kycData } = useGetData<APIResponse<CustomerKycSubmission | null>>({ url: API_ENDPOINTS.customer.kyc.status, shouldFetch: isAwaitingPayment });

  const refetchKeys = [[API_ENDPOINTS.customer.shipments.list("?page=1&limit=10")], [trackingUrl], [API_ENDPOINTS.customer.wallet.balance], [API_ENDPOINTS.customer.wallet.transactions]];

  const isPaid = shipment?.payment_status === "PAID";

  const { mutate: cancelShipment, isPending: isCancelling } = useSubmitData<Record<string, never>, unknown>({
    url: API_ENDPOINTS.customer.shipments.cancel(shipmentId),
    onSuccessMessage: isPaid ? "Shipment cancelled — your wallet has been refunded" : "Shipment cancelled",
    additionalQueryKeys: refetchKeys,
    onSuccess: () => setIsConfirmingCancel(false),
  });

  const { mutate: payShipment, isPending: isPaying } = useSubmitData<Record<string, never>, unknown>({
    url: API_ENDPOINTS.customer.shipments.pay(shipmentId),
    onSuccessMessage: "Payment received — your shipment is on its way",
    additionalQueryKeys: refetchKeys,
  });

  if (isFetching && !shipment) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!shipment) return null;

  const status = SHIPMENT_STATUS[shipment.status];
  const paymentStatus = PAYMENT_STATUS[shipment.payment_status];
  const canCancel = shipment.status === "PENDING_PICKUP" || shipment.status === "PENDING_DROP_OFF";
  const isKycVerified = kycData?.data?.status === "APPROVED";
  const hasEnoughBalance = (walletData?.data?.available_minor ?? 0) >= shipment.amount_minor;

  return (
    <div>
      <PageHeader
        title={shipment.reference}
        description={`Booked ${formatDateTime(shipment.createdAt)}`}
        action={
          canCancel ? (
            <Button variant="destructive" onClick={() => setIsConfirmingCancel(true)}>
              Cancel shipment
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge label={status.label} className={status.className} />
        <StatusBadge label={paymentStatus.label} className={paymentStatus.className} />
        <StatusBadge label={shipment.fulfilment_type === "DROP_OFF" ? "Drop-off" : "Courier pickup"} className="bg-muted text-muted-foreground" />
        <span className="ml-auto text-2xl font-bold text-brand">{formatNaira(shipment.amount_minor)}</span>
      </div>

      {isAwaitingPayment && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-brand-muted px-5 py-4">
          <p className="text-sm text-foreground">
            We've received and verified your parcel.{" "}
            {isKycVerified
              ? hasEnoughBalance
                ? "Complete payment to start shipping."
                : `Your wallet holds ${formatNaira(walletData?.data?.available_minor ?? 0)} — fund it to pay for this shipment.`
              : "Verify your identity once to pay for shipments."}
          </p>
          {!isKycVerified ? (
            <Button asChild>
              <Link href="/dashboard/customer/kyc">Verify identity</Link>
            </Button>
          ) : hasEnoughBalance ? (
            <Button onClick={() => payShipment({})} disabled={isPaying}>
              {isPaying && <Loader2 className="animate-spin" />}
              Pay {formatNaira(shipment.amount_minor)}
            </Button>
          ) : (
            <Button onClick={() => router.push("/dashboard/customer/wallet")}>Fund wallet</Button>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold text-foreground">Details</p>
          <div className="mt-2 divide-y divide-line">
            <InfoRow label="From" value={`${shipment.origin.contact_name} — ${shipment.origin.line1}, ${shipment.origin.city}, ${shipment.origin.state}`} />
            <InfoRow label="To" value={`${shipment.destination.contact_name} — ${shipment.destination.line1}, ${shipment.destination.city}, ${shipment.destination.state}`} />
            <InfoRow label="Courier" value={`${shipment.courier_name} · ${shipment.service_name}`} />
            <InfoRow label="ETA" value={shipment.eta_min_days ? `${shipment.eta_min_days}–${shipment.eta_max_days} business days` : "—"} />
            <InfoRow label={shipment.fulfilment_type === "DROP_OFF" ? "Fulfilment" : "Pickup date"} value={shipment.fulfilment_type === "DROP_OFF" ? "Drop-off at our office" : shipment.pickup_date ? formatDate(shipment.pickup_date) : "—"} />
            <InfoRow label="Purpose" value={SHIPMENT_PURPOSES.find(entry => entry.value === shipment.purpose)?.label ?? shipment.purpose} />
          </div>

          <p className="mt-6 text-sm font-semibold text-foreground">Parcels</p>
          <ul className="mt-2 space-y-2">
            {shipment.parcels.map((parcel, index) => (
              <li key={index} className="rounded-lg bg-canvas px-3 py-2 text-sm text-foreground">
                {parcel.length_cm}×{parcel.width_cm}×{parcel.height_cm}cm · {parcel.items.map(item => `${item.quantity}× ${item.name}`).join(", ")}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold text-foreground">Tracking</p>
          <ol className="mt-4 space-y-4">
            {events.map((event, index) => {
              const eventStatus = SHIPMENT_STATUS[event.to_status];
              const isLatest = index === events.length - 1;
              return (
                <li key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full ${isLatest ? "bg-brand" : "bg-line-strong"}`} />
                    {index < events.length - 1 && <div className="w-px flex-1 bg-line" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-semibold text-foreground">{eventStatus?.label ?? event.to_status}</p>
                    {event.note && <p className="mt-0.5 text-sm text-muted-foreground">{event.note}</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmingCancel}
        title="Cancel this shipment?"
        description={isPaid ? "The full amount goes straight back to your wallet." : "Nothing has been paid yet, so there's nothing to refund."}
        confirmLabel="Cancel shipment"
        cancelLabel="Keep it"
        isDestructive
        isLoading={isCancelling}
        onConfirm={() => cancelShipment({})}
        onCancel={() => setIsConfirmingCancel(false)}
      />
    </div>
  );
}

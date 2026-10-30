"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatDateTime, formatNaira } from "@/lib/format";
import { showToast } from "@/lib/show-toast";
import { PAYMENT_STATUS, SHIPMENT_STATUS } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import type { CustomerKycSubmission, CustomerShipment, CustomerShipmentEvent, ShipmentAddressSnapshot } from "@/types/customer";
import { SHIPMENT_PURPOSES } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { ArrowRight, Box, Copy, Landmark } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PaymentCard } from "./_components/payment-card";
import { PaymentDialog } from "./_components/payment-dialog";

const InfoRow = function ({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-[13px]">
      <span className="shrink-0 text-foreground-muted">{label}</span>
      <span className="min-w-0 text-right font-medium break-words text-foreground">{value}</span>
    </div>
  );
};

const CopyButton = function ({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      aria-label={`Copy ${label.toLowerCase()}`}
      onClick={() => {
        navigator.clipboard.writeText(value);
        showToast("success", `${label} copied`);
      }}
      className="flex size-6 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      <Copy className="size-3.5" />
    </button>
  );
};

const AddressBlock = function ({ label, address, align = "left" }: { label: string; address: ShipmentAddressSnapshot; align?: "left" | "right" }) {
  return (
    <div className={cn("min-w-0", align === "right" && "sm:text-right")}>
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className="truncate text-xl font-bold tracking-tight text-foreground">{address.city}</p>
      <p className="mt-1 text-[12.5px] text-foreground-muted">{address.contact_name}</p>
      <p className="text-[12.5px] text-foreground-muted">
        {address.line1}, {address.state}
      </p>
    </div>
  );
};

export default function CustomerShipmentDetailPage() {
  const { shipmentId = "" } = useParams<{ shipmentId: string }>();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const trackingUrl = API_ENDPOINTS.customer.shipments.tracking(shipmentId);
  const { data, isFetching } = useGetData<APIResponse<{ shipment: CustomerShipment; events: CustomerShipmentEvent[] }>>({ url: trackingUrl });
  const shipment = data?.data?.shipment;
  const events = data?.data?.events ?? [];

  // Pickups pay straight after booking; drop-offs once the office has verified the parcel.
  const isPayable = !!shipment && shipment.payment_status === "UNPAID" && (shipment.fulfilment_type === "PICKUP" ? shipment.status === "PENDING_PICKUP" : shipment.status === "RECEIVED");

  const { data: kycData } = useGetData<APIResponse<CustomerKycSubmission | null>>({ url: API_ENDPOINTS.customer.kyc.status, shouldFetch: isPayable });

  const refetchKeys = [[API_ENDPOINTS.customer.shipments.list("?page=1&limit=10")], [trackingUrl], [API_ENDPOINTS.customer.dashboard.summary]];

  const { mutate: cancelShipment, isPending: isCancelling } = useSubmitData<Record<string, never>, unknown>({
    url: API_ENDPOINTS.customer.shipments.cancel(shipmentId),
    onSuccessMessage: "Shipment cancelled",
    additionalQueryKeys: refetchKeys,
    onSuccess: () => setIsConfirmingCancel(false),
  });

  if (isFetching && !shipment) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!shipment) return null;

  const status = SHIPMENT_STATUS[shipment.status];
  const paymentStatus = PAYMENT_STATUS[shipment.payment_status];
  const canCancel = (shipment.status === "PENDING_PICKUP" || shipment.status === "PENDING_DROP_OFF") && shipment.payment_status === "UNPAID";
  const isKycVerified = kycData?.data?.status === "APPROVED";
  const isKycPending = kycData?.data?.status === "PENDING";

  return (
    <div>
      <PageHeader
        backHref="/dashboard/customer/shipments"
        title={shipment.reference}
        description={`Booked ${formatDateTime(shipment.createdAt)}`}
        action={
          canCancel ? (
            <Button variant="destructive" className="h-10 w-full rounded-xl px-4 sm:w-auto" onClick={() => setIsConfirmingCancel(true)}>
              Cancel shipment
            </Button>
          ) : undefined
        }
      />

      {isPayable && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-brand/25 bg-brand-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-brand">
              <Landmark className="size-4.5" />
            </span>
            <p className="text-[13px] text-foreground">
              {shipment.status === "RECEIVED" ? "We've received and verified your parcel. " : ""}
              {isKycVerified
                ? `Pay ${formatNaira(shipment.amount_minor)} by bank transfer and upload your receipt to ${shipment.fulfilment_type === "PICKUP" ? "schedule your pickup" : "start shipping"}.`
                : isKycPending
                  ? "Your identity verification is under review. You can pay once it's approved."
                  : "Verify your identity once to pay for shipments."}
            </p>
          </div>
          {isKycVerified ? (
            <Button className="h-10 shrink-0 rounded-xl px-4" onClick={() => setIsPaying(true)}>
              Pay now
            </Button>
          ) : (
            !isKycPending && (
              <Button asChild className="h-10 shrink-0 rounded-xl px-4">
                <Link href="/dashboard/customer/kyc">Verify identity</Link>
              </Button>
            )
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard title="Route" description={`${shipment.courier_name} · ${shipment.service_name}`}>
            <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-5 sm:p-5.5">
              <AddressBlock label="From" address={shipment.origin} />
              <span className="hidden size-8 items-center justify-center rounded-full bg-brand-muted text-brand sm:flex">
                <ArrowRight className="size-4" />
              </span>
              <AddressBlock label="To" address={shipment.destination} align="right" />
            </div>
            <div className="divide-y divide-line border-t border-line px-5 sm:px-5.5">
              <InfoRow
                label="Reference"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-mono">{shipment.reference}</span>
                    <CopyButton label="Reference" value={shipment.reference} />
                  </span>
                }
              />
              {shipment.courier_tracking_number && (
                <InfoRow
                  label="Tracking number"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-mono">{shipment.courier_tracking_number}</span>
                      <CopyButton label="Tracking number" value={shipment.courier_tracking_number} />
                    </span>
                  }
                />
              )}
              <InfoRow label="ETA" value={shipment.eta_min_days ? `${shipment.eta_min_days} to ${shipment.eta_max_days} business days` : "-"} />
              <InfoRow label={shipment.fulfilment_type === "DROP_OFF" ? "Fulfilment" : "Pickup date"} value={shipment.fulfilment_type === "DROP_OFF" ? "Drop-off at our office" : shipment.pickup_date ? formatDate(shipment.pickup_date) : "-"} />
              <InfoRow label="Purpose" value={SHIPMENT_PURPOSES.find(entry => entry.value === shipment.purpose)?.label ?? shipment.purpose} />
            </div>
          </SectionCard>

          <SectionCard title="Parcels" description={`${shipment.parcels.length} ${shipment.parcels.length === 1 ? "box" : "boxes"}`}>
            <ul className="divide-y divide-line">
              {shipment.parcels.map((parcel, index) => (
                <li key={index} className="flex gap-3 px-5 py-3.5 sm:px-5.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-muted text-foreground-muted">
                    <Box className="size-4" />
                  </span>
                  <div className="min-w-0 text-[13px]">
                    <p className="font-semibold text-foreground tabular-nums">
                      {parcel.length_cm}×{parcel.width_cm}×{parcel.height_cm}cm
                    </p>
                    <p className="text-foreground-muted">{parcel.items.map(item => `${item.quantity}× ${item.name}`).join(", ")}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <section className="rounded-2xl border border-line bg-white p-5 sm:p-5.5">
            <p className="text-[13px] font-medium text-foreground-muted">Shipment total</p>
            <p className="mt-1.5 text-[28px] font-extrabold tracking-tight text-foreground tabular-nums">{formatNaira(shipment.amount_minor)}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <StatusBadge label={status.label} className={status.className} />
              <StatusBadge label={paymentStatus.label} className={paymentStatus.className} />
              <StatusBadge label={shipment.fulfilment_type === "DROP_OFF" ? "Drop-off" : "Courier pickup"} className="bg-surface-muted text-foreground-muted" />
            </div>
          </section>

          <PaymentCard shipment={shipment} isPayable={isPayable && isKycVerified} onPay={() => setIsPaying(true)} />

          <SectionCard title="Tracking" description="Every update on this shipment">
            {events.length === 0 ? (
              <p className="p-5 text-[13px] text-foreground-muted sm:p-5.5">No updates yet. We&apos;ll post each step here.</p>
            ) : (
              <ol className="px-5 py-1.5 sm:px-5.5">
                {events.map((event, index) => {
                  const eventStatus = SHIPMENT_STATUS[event.to_status];
                  const isLatest = index === events.length - 1;
                  return (
                    <li key={event.id} className="relative flex gap-3 py-3">
                      {!isLatest && <span aria-hidden className="absolute top-7 -bottom-1 left-1.25 w-px bg-line" />}
                      <span className={cn("mt-1 size-2.75 shrink-0 rounded-full", isLatest ? "bg-brand ring-4 ring-brand-muted" : "bg-line-strong")} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground">{eventStatus?.label ?? event.to_status}</p>
                        {event.note && <p className="mt-0.5 text-[13px] break-words text-foreground-muted">{event.note}</p>}
                        <p className="mt-0.5 text-xs text-foreground-subtle">{formatDateTime(event.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </SectionCard>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmingCancel}
        title="Cancel this shipment?"
        description="Nothing has been paid yet, so there's nothing to refund."
        confirmLabel="Cancel shipment"
        cancelLabel="Keep it"
        isDestructive
        isLoading={isCancelling}
        onConfirm={() => cancelShipment({})}
        onCancel={() => setIsConfirmingCancel(false)}
      />

      <PaymentDialog shipment={shipment} open={isPaying} onClose={() => setIsPaying(false)} refetchKeys={refetchKeys} />
    </div>
  );
}

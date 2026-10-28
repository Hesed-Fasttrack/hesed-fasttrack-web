"use client";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatDateTime, formatNaira } from "@/lib/format";
import { PAYMENT_STATUS, SHIPMENT_STATUS } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import { displayName, type AdminShipment, type ShipmentEvent, type SnapshotAddress } from "@/types/admin";
import type { APIResponse } from "@/types/response";
import { ArrowRight, Box, Loader2, TriangleAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { EditShipmentDialog } from "./_components/edit-shipment-dialog";
import { TransitionDialog } from "./_components/transition-dialog";

const InfoRow = function ({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-[13px]">
      <span className="shrink-0 text-foreground-muted">{label}</span>
      <span className="min-w-0 text-right font-medium break-words text-foreground">{value}</span>
    </div>
  );
};

const AddressBlock = function ({ label, address, align = "left" }: { label: string; address: SnapshotAddress; align?: "left" | "right" }) {
  return (
    <div className={cn("min-w-0", align === "right" && "sm:text-right")}>
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className="truncate text-xl font-bold tracking-tight text-foreground">{address.city}</p>
      <p className="mt-1 text-[12.5px] text-foreground-muted">
        {address.contact_name}
        {address.contact_phone ? ` · ${address.contact_phone}` : ""}
      </p>
      <p className="text-[12.5px] text-foreground-muted">
        {address.line1}, {address.state}, {address.country}
      </p>
    </div>
  );
};

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED"] as const;

export default function AdminShipmentDetailPage() {
  const { shipmentId = "" } = useParams<{ shipmentId: string }>();
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const senderIdInputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = useGetData<APIResponse<AdminShipment & { events: ShipmentEvent[] }>>({
    url: API_ENDPOINTS.admin.shipments.detail(shipmentId),
  });
  const shipment = data?.data;

  const { mutate: retryDispatch, isPending: isRetrying } = useSubmitData<Record<string, never>, unknown>({
    url: API_ENDPOINTS.admin.shipments.retryCourierPurchase(shipmentId),
    onSuccessMessage: "Shipment dispatched to the courier",
    additionalQueryKeys: [[API_ENDPOINTS.admin.shipments.detail(shipmentId)]],
  });

  const { mutate: attachSenderId, isPending: isAttachingSenderId } = useSubmitData<FormData, unknown>({
    url: API_ENDPOINTS.admin.shipments.attachSenderId(shipmentId),
    onSuccessMessage: "Sender ID attached",
    additionalQueryKeys: [[API_ENDPOINTS.admin.shipments.detail(shipmentId)]],
  });

  const handleSenderIdPick = function (event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("sender_id_document", file);
    attachSenderId(formData);
  };

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
  const isTerminal = TERMINAL_STATUSES.includes(shipment.status as (typeof TERMINAL_STATUSES)[number]);
  // Office verification may correct a drop-off's parcels while it's still unpaid.
  const isEditable = shipment.fulfilment_type === "DROP_OFF" && shipment.payment_status === "UNPAID" && (shipment.status === "PENDING_DROP_OFF" || shipment.status === "RECEIVED");

  return (
    <div>
      <PageHeader
        backHref="/dashboard/admin/shipments"
        title={shipment.reference}
        description={`Booked ${formatDateTime(shipment.createdAt)}${shipment.user ? ` by ${displayName(shipment.user)}` : ""}`}
        action={
          !isTerminal ? (
            <div className="flex w-full gap-2.5 sm:w-auto">
              {isEditable && (
                <Button variant="outline" className="h-10 flex-1 rounded-xl px-4 sm:flex-none" onClick={() => setIsEditOpen(true)}>
                  Edit details
                </Button>
              )}
              <Button className="h-10 flex-1 rounded-xl px-4 sm:flex-none" onClick={() => setIsTransitionOpen(true)}>
                Update status
              </Button>
            </div>
          ) : undefined
        }
      />

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
              <InfoRow label="ETA" value={shipment.eta_min_days ? `${shipment.eta_min_days} to ${shipment.eta_max_days} business days` : "-"} />
              <InfoRow label="Pickup date" value={shipment.pickup_date ? formatDate(shipment.pickup_date) : "Drop-off"} />
              <InfoRow label="Purpose" value={shipment.purpose} />
              {shipment.third_party_sender && (
                <InfoRow
                  label="Sender ID"
                  value={
                    shipment.sender_id_document_url ? (
                      <a href={shipment.sender_id_document_url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                        View document (third-party sender)
                      </a>
                    ) : (
                      "Third-party sender, no document on file"
                    )
                  }
                />
              )}
              {!isTerminal && (
                <InfoRow
                  label={shipment.sender_id_document_url ? "Update sender ID" : "Attach sender ID"}
                  value={
                    <>
                      <input ref={senderIdInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleSenderIdPick} />
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => senderIdInputRef.current?.click()} disabled={isAttachingSenderId}>
                        {isAttachingSenderId && <Loader2 className="animate-spin" />}
                        {shipment.sender_id_document_url ? "Replace document" : "Upload ID photo"}
                      </Button>
                    </>
                  }
                />
              )}
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

          <SectionCard
            title="Courier dispatch"
            action={
              shipment.courier_purchase_error && !shipment.courier_tracking_number && shipment.payment_status === "PAID" ? (
                <Button size="sm" variant="outline" className="shrink-0 rounded-lg" onClick={() => retryDispatch({})} disabled={isRetrying}>
                  {isRetrying && <Loader2 className="animate-spin" />}
                  Retry courier dispatch
                </Button>
              ) : undefined
            }
          >
            {shipment.courier_tracking_number ? (
              <div className="divide-y divide-line px-5 sm:px-5.5">
                <InfoRow label="Courier reference" value={<span className="font-mono">{shipment.courier_shipment_reference ?? "-"}</span>} />
                <InfoRow
                  label="Tracking number"
                  value={
                    shipment.courier_tracking_url ? (
                      <a href={shipment.courier_tracking_url} target="_blank" rel="noopener noreferrer" className="font-mono text-brand hover:underline">
                        {shipment.courier_tracking_number}
                      </a>
                    ) : (
                      <span className="font-mono">{shipment.courier_tracking_number}</span>
                    )
                  }
                />
              </div>
            ) : shipment.courier_purchase_error ? (
              <div className="p-5 sm:p-5.5">
                <div className="flex gap-2.5 rounded-xl bg-danger/10 px-3.5 py-3 text-[13px] text-danger">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <p className="min-w-0 break-words">{shipment.courier_purchase_error}</p>
                </div>
              </div>
            ) : (
              <p className="p-5 text-[13px] text-foreground-muted sm:p-5.5">{shipment.payment_status === "PAID" ? "Dispatch pending…" : "Dispatches once the shipment is paid."}</p>
            )}
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

          <SectionCard title="Timeline" description="Oldest first">
            {shipment.events.length === 0 ? (
              <p className="p-5 text-[13px] text-foreground-muted sm:p-5.5">No status changes yet.</p>
            ) : (
              <ol className="px-5 py-1.5 sm:px-5.5">
                {shipment.events.map((event, index) => {
                  const eventStatus = SHIPMENT_STATUS[event.to_status];
                  const isLatest = index === shipment.events.length - 1;
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

      <TransitionDialog shipmentId={shipmentId} currentStatus={shipment.status} open={isTransitionOpen} onClose={() => setIsTransitionOpen(false)} />
      <EditShipmentDialog shipment={shipment} open={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
}

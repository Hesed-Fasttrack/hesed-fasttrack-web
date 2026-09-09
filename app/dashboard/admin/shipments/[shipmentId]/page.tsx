"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatDateTime, formatNaira } from "@/lib/format";
import { PAYMENT_STATUS, SHIPMENT_STATUS } from "@/lib/statuses";
import { displayName, type AdminShipment, type ShipmentEvent } from "@/types/admin";
import type { APIResponse } from "@/types/response";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { EditShipmentDialog } from "./_components/edit-shipment-dialog";
import { TransitionDialog } from "./_components/transition-dialog";

const InfoRow = function ({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
};

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED"] as const;

export default function AdminShipmentDetailPage() {
  const { shipmentId = "" } = useParams<{ shipmentId: string }>();
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data, isFetching } = useGetData<APIResponse<AdminShipment & { events: ShipmentEvent[] }>>({
    url: API_ENDPOINTS.admin.shipments.detail(shipmentId),
  });
  const shipment = data?.data;

  const { mutate: retryDispatch, isPending: isRetrying } = useSubmitData<Record<string, never>, unknown>({
    url: API_ENDPOINTS.admin.shipments.retryCourierPurchase(shipmentId),
    onSuccessMessage: "Shipment dispatched to the courier",
    additionalQueryKeys: [[API_ENDPOINTS.admin.shipments.detail(shipmentId)]],
  });

  if (isFetching && !shipment) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!shipment) return null;

  const status = SHIPMENT_STATUS[shipment.status];
  const paymentStatus = PAYMENT_STATUS[shipment.payment_status];
  const isTerminal = TERMINAL_STATUSES.includes(shipment.status as (typeof TERMINAL_STATUSES)[number]);
  // Office verification may correct a drop-off's parcels while it's still unpaid.
  const isEditable = shipment.fulfilment_type === "DROP_OFF" && shipment.payment_status === "UNPAID" && (shipment.status === "PENDING_DROP_OFF" || shipment.status === "RECEIVED");
  const parcelSummary = shipment.parcels.map(parcel => `${parcel.length_cm}×${parcel.width_cm}×${parcel.height_cm}cm · ${parcel.items.map(item => `${item.quantity}× ${item.name}`).join(", ")}`);

  return (
    <div>
      <PageHeader
        title={shipment.reference}
        description={`Booked ${formatDateTime(shipment.createdAt)}${shipment.user ? ` by ${displayName(shipment.user)}` : ""}`}
        action={
          !isTerminal ? (
            <div className="flex gap-2">
              {isEditable && (
                <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                  Edit details
                </Button>
              )}
              <Button onClick={() => setIsTransitionOpen(true)}>Update status</Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge label={status.label} className={status.className} />
        <StatusBadge label={paymentStatus.label} className={paymentStatus.className} />
        <StatusBadge label={shipment.fulfilment_type === "DROP_OFF" ? "Drop-off" : "Courier pickup"} className="bg-muted text-muted-foreground" />
        <span className="ml-auto text-2xl font-bold text-brand">{formatNaira(shipment.amount_minor)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold text-foreground">Route</p>
          <div className="mt-2 divide-y divide-line">
            <InfoRow label="From" value={`${shipment.origin.contact_name} — ${shipment.origin.line1}, ${shipment.origin.city}, ${shipment.origin.state}, ${shipment.origin.country}`} />
            <InfoRow label="To" value={`${shipment.destination.contact_name} — ${shipment.destination.line1}, ${shipment.destination.city}, ${shipment.destination.state}, ${shipment.destination.country}`} />
            <InfoRow label="Courier" value={`${shipment.courier_name} · ${shipment.service_name}`} />
            <InfoRow label="ETA" value={shipment.eta_min_days ? `${shipment.eta_min_days}–${shipment.eta_max_days} business days` : "—"} />
            <InfoRow label="Pickup date" value={shipment.pickup_date ? formatDate(shipment.pickup_date) : "Drop-off"} />
            <InfoRow label="Purpose" value={shipment.purpose} />
          </div>

          <p className="mt-6 text-sm font-semibold text-foreground">Parcels</p>
          <ul className="mt-2 space-y-2">
            {parcelSummary.map(line => (
              <li key={line} className="rounded-lg bg-canvas px-3 py-2 text-sm text-foreground">
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm font-semibold text-foreground">Courier dispatch</p>
          <div className="mt-2 divide-y divide-line">
            {shipment.courier_tracking_number ? (
              <>
                <InfoRow label="Courier reference" value={shipment.courier_shipment_reference ?? "—"} />
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
              </>
            ) : shipment.courier_purchase_error ? (
              <div className="py-3">
                <p className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">{shipment.courier_purchase_error}</p>
                {shipment.payment_status === "PAID" && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => retryDispatch({})} disabled={isRetrying}>
                    {isRetrying && <Loader2 className="animate-spin" />}
                    Retry courier dispatch
                  </Button>
                )}
              </div>
            ) : (
              <p className="py-3 text-sm text-muted-foreground">{shipment.payment_status === "PAID" ? "Dispatch pending…" : "Dispatches once the shipment is paid."}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold text-foreground">Timeline</p>
          <ol className="mt-4 space-y-4">
            {shipment.events.map((event, index) => {
              const eventStatus = SHIPMENT_STATUS[event.to_status];
              const isLatest = index === shipment.events.length - 1;
              return (
                <li key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full ${isLatest ? "bg-brand" : "bg-line-strong"}`} />
                    {index < shipment.events.length - 1 && <div className="w-px flex-1 bg-line" />}
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

      <TransitionDialog shipmentId={shipmentId} open={isTransitionOpen} onClose={() => setIsTransitionOpen(false)} />
      <EditShipmentDialog shipment={shipment} open={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
}

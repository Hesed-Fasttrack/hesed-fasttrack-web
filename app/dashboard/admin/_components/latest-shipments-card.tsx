"use client";

import { RouteText } from "@/components/shared/route-text";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { PAYMENT_STATUS, SHIPMENT_STATUS } from "@/lib/statuses";
import { displayName, type AdminShipment, type PaginatedResponse } from "@/types/admin";
import { useRouter } from "next/navigation";

const initialsOf = (shipment: AdminShipment) => `${shipment.user?.first_name?.[0] ?? ""}${shipment.user?.last_name?.[0] ?? ""}`.toUpperCase() || "·";

export const LatestShipmentsCard = function () {
  const router = useRouter();
  const { data, isFetching } = useGetData<PaginatedResponse<AdminShipment>>({ url: API_ENDPOINTS.admin.shipments.list("?page=1&limit=6") });
  const shipments = data?.data ?? [];

  return (
    <SectionCard title="Latest shipments" description="Newest bookings across all customers" link={{ href: "/dashboard/admin/shipments", label: "View all" }}>
      {isFetching && shipments.length === 0 ? (
        <div className="space-y-3 p-5.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-11 rounded-xl" />
          ))}
        </div>
      ) : shipments.length === 0 ? (
        <p className="px-5 py-14 text-center text-sm text-foreground-muted">No shipments booked yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {shipments.map(shipment => {
            const status = SHIPMENT_STATUS[shipment.status];
            const payment = PAYMENT_STATUS[shipment.payment_status];

            return (
              <li key={shipment.id} onClick={() => router.push(`/dashboard/admin/shipments/${shipment.id}`)} className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors hover:bg-canvas sm:gap-4 sm:px-5.5">
                <span className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-bold text-foreground-muted sm:flex">{initialsOf(shipment)}</span>
                <div className="min-w-0 flex-1">
                  <RouteText from={shipment.origin.city} to={shipment.destination.city} className="text-sm" />
                  <p className="mt-0.5 truncate text-xs text-foreground-muted">
                    <span className="font-mono">{shipment.reference}</span> · {displayName(shipment.user)}
                  </p>
                </div>
                <span className="hidden text-sm text-foreground tabular-nums md:block">{formatNaira(shipment.amount_minor)}</span>
                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-1.5">
                  {shipment.payment_status !== "PAID" && <StatusBadge label={payment.label} className={payment.className} />}
                  <StatusBadge label={status.label} className={status.className} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
};

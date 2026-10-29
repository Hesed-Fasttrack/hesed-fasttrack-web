"use client";

import { RouteText } from "@/components/shared/route-text";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/table-helpers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/lib/format";
import { SHIPMENT_STATUS } from "@/lib/statuses";
import type { CustomerShipment } from "@/types/customer";
import { format } from "date-fns";
import { Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Route = ({ shipment }: { shipment: CustomerShipment }) => (
  <RouteText from={shipment.origin.city} to={shipment.destination.city} />
);

export const RecentShipmentsCard = function ({
  shipments,
  isLoading,
}: {
  shipments: CustomerShipment[];
  isLoading: boolean;
}) {
  const router = useRouter();
  const open = (id: string) =>
    router.push(`/dashboard/customer/shipments/${id}`);

  return (
    <SectionCard
      title="Recent shipments"
      description="Your last 5 bookings"
      link={{ href: "/dashboard/customer/shipments", label: "View all" }}
    >
      {isLoading && shipments.length === 0 ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-11 rounded-xl" />
          ))}
        </div>
      ) : shipments.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No shipments yet"
          message="Your bookings show up here. Get a quote to see prices for your route."
          action={
            <Button asChild variant="outline" className="h-10 rounded-xl px-5">
              <Link href="/dashboard/customer/quick-quote">Get a quote</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas text-left text-[11.5px] font-semibold tracking-wide text-foreground-subtle uppercase">
                  <th className="px-5.5 py-3 font-semibold">Reference</th>
                  <th className="px-3 py-3 font-semibold">Route</th>
                  <th className="hidden px-3 py-3 font-semibold 2xl:table-cell">
                    Booked
                  </th>
                  <th className="px-3 py-3 text-right font-semibold">Amount</th>
                  <th className="px-5.5 py-3 text-right font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shipments.map((shipment) => {
                  const status = SHIPMENT_STATUS[shipment.status];
                  return (
                    <tr
                      key={shipment.id}
                      onClick={() => open(shipment.id)}
                      className="cursor-pointer transition-colors hover:bg-canvas"
                    >
                      <td className="px-5.5 py-3.5 font-mono text-[12.5px] font-semibold whitespace-nowrap text-foreground">
                        {shipment.reference}
                      </td>
                      <td className="max-w-50 px-3 py-3.5">
                        <Route shipment={shipment} />
                      </td>
                      <td className="hidden px-3 py-3.5 whitespace-nowrap text-foreground-muted 2xl:table-cell">
                        {format(new Date(shipment.createdAt), "d MMM")}
                      </td>
                      <td className="px-3 py-3.5 text-right whitespace-nowrap text-foreground tabular-nums">
                        {formatNaira(shipment.amount_minor)}
                      </td>
                      <td className="px-5.5 py-3.5 text-right">
                        <StatusBadge
                          label={status.label}
                          className={status.className}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line md:hidden">
            {shipments.map((shipment) => {
              const status = SHIPMENT_STATUS[shipment.status];
              return (
                <li
                  key={shipment.id}
                  onClick={() => open(shipment.id)}
                  className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 active:bg-canvas"
                >
                  <div className="min-w-0 text-sm">
                    <Route shipment={shipment} />
                    <p className="mt-0.5 truncate font-mono text-xs text-foreground-muted">
                      {shipment.reference}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      {formatNaira(shipment.amount_minor)}
                    </span>
                    <StatusBadge
                      label={status.label}
                      className={status.className}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </SectionCard>
  );
};

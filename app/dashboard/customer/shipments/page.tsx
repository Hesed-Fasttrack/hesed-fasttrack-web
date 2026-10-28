"use client";

import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { PageHeader } from "@/components/shared/page-header";
import { RouteText } from "@/components/shared/route-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableCard, TOOLBAR_SELECT_CLASS } from "@/components/shared/table-card";
import { EmptyState, PaginationControls, TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatNaira } from "@/lib/format";
import { PAYMENT_STATUS, SHIPMENT_STATUS } from "@/lib/statuses";
import { buildQuery } from "@/lib/utils";
import type { PaginatedResponse } from "@/types/admin";
import type { CustomerShipment } from "@/types/customer";
import { Package, PackagePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COLUMNS = 6;
const EMPTY_MESSAGE = "No shipments in this view. Book one to get started.";

export default function CustomerShipmentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const query = buildQuery({ page, limit: 10, status: status === "all" ? undefined : status });

  const { data, isFetching } = useGetData<PaginatedResponse<CustomerShipment>>({ url: API_ENDPOINTS.customer.shipments.list(query) });
  const shipments = data?.data ?? [];
  const isLoading = isFetching && shipments.length === 0;
  const open = (id: string) => router.push(`/dashboard/customer/shipments/${id}`);

  return (
    <div>
      <PageHeader
        title="Shipments"
        description="Everything you've booked, and where it is."
        action={
          <Button asChild className="h-10 rounded-xl px-4">
            <Link href="/dashboard/customer/book">
              <PackagePlus />
              Book a shipment
            </Link>
          </Button>
        }
      />

      <TableCard
        title="All shipments"
        description={data ? `${data.total.toLocaleString()} in this view` : undefined}
        toolbar={
          <AppSimpleSelect
            containerClassName="w-full sm:w-52"
            className={TOOLBAR_SELECT_CLASS}
            value={status}
            onValueChange={value => {
              setStatus(value);
              setPage(1);
            }}
            options={[{ label: "All statuses", value: "all" }, ...Object.entries(SHIPMENT_STATUS).map(([value, presentation]) => ({ label: presentation.label, value }))]}
          />
        }
        footer={<PaginationControls page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} total={data?.total ?? 0} onPageChange={setPage} />}
      >
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Booked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows columns={COLUMNS} />
              ) : shipments.length === 0 ? (
                <TableEmptyRow columns={COLUMNS} icon={Package} message={EMPTY_MESSAGE} />
              ) : (
                shipments.map(shipment => {
                  const shipmentStatus = SHIPMENT_STATUS[shipment.status];
                  const paymentStatus = PAYMENT_STATUS[shipment.payment_status];
                  return (
                    <TableRow key={shipment.id} className="cursor-pointer" onClick={() => open(shipment.id)}>
                      <TableCell className="font-mono text-[12.5px] font-semibold">{shipment.reference}</TableCell>
                      <TableCell className="max-w-52">
                        <RouteText from={shipment.origin.city} to={shipment.destination.city} />
                      </TableCell>
                      <TableCell className="text-foreground-muted">{shipment.courier_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {shipment.payment_status !== "PAID" && <StatusBadge label={paymentStatus.label} className={paymentStatus.className} />}
                          <span className="tabular-nums">{formatNaira(shipment.amount_minor)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge label={shipmentStatus.label} className={shipmentStatus.className} />
                      </TableCell>
                      <TableCell className="text-foreground-muted">{formatDate(shipment.createdAt)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : shipments.length === 0 ? (
            <EmptyState icon={Package} message={EMPTY_MESSAGE} />
          ) : (
            <ul className="divide-y divide-line">
              {shipments.map(shipment => {
                const shipmentStatus = SHIPMENT_STATUS[shipment.status];
                return (
                  <li key={shipment.id} onClick={() => open(shipment.id)} className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 active:bg-canvas">
                    <div className="min-w-0 text-sm">
                      <RouteText from={shipment.origin.city} to={shipment.destination.city} />
                      <p className="mt-0.5 truncate font-mono text-xs text-foreground-muted">{shipment.reference}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-foreground tabular-nums">{formatNaira(shipment.amount_minor)}</span>
                      <StatusBadge label={shipmentStatus.label} className={shipmentStatus.className} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </TableCard>
    </div>
  );
}

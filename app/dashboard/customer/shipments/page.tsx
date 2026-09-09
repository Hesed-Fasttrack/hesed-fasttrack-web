"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaginationControls, TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatNaira } from "@/lib/format";
import { PAYMENT_STATUS, SHIPMENT_STATUS } from "@/lib/statuses";
import { buildQuery } from "@/lib/utils";
import type { PaginatedResponse } from "@/types/admin";
import type { CustomerShipment } from "@/types/customer";
import { PackagePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COLUMNS = 6;

export default function CustomerShipmentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const query = buildQuery({ page, limit: 10, status: status === "all" ? undefined : status });

  const { data, isFetching } = useGetData<PaginatedResponse<CustomerShipment>>({ url: API_ENDPOINTS.customer.shipments.list(query) });
  const shipments = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Shipments"
        description="Everything you've booked, and where it is."
        action={
          <Button asChild>
            <Link href="/dashboard/customer/book">
              <PackagePlus />
              Book a shipment
            </Link>
          </Button>
        }
      />

      <div className="mb-4">
        <Select
          value={status}
          onValueChange={value => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(SHIPMENT_STATUS).map(([value, presentation]) => (
              <SelectItem key={value} value={value}>
                {presentation.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && shipments.length === 0 ? (
              <TableSkeletonRows columns={COLUMNS} />
            ) : shipments.length === 0 ? (
              <TableEmptyRow columns={COLUMNS} message="No shipments in this view — book one to get started." />
            ) : (
              shipments.map(shipment => {
                const shipmentStatus = SHIPMENT_STATUS[shipment.status];
                const paymentStatus = PAYMENT_STATUS[shipment.payment_status];
                return (
                  <TableRow key={shipment.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/customer/shipments/${shipment.id}`)}>
                    <TableCell className="font-mono text-xs font-medium">{shipment.reference}</TableCell>
                    <TableCell>
                      {shipment.origin.city} → {shipment.destination.city}
                    </TableCell>
                    <TableCell>{shipment.courier_name}</TableCell>
                    <TableCell className="font-semibold">
                      {formatNaira(shipment.amount_minor)}
                      <span className="ml-2 inline-block align-middle">
                        <StatusBadge label={paymentStatus.label} className={paymentStatus.className} />
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge label={shipmentStatus.label} className={shipmentStatus.className} />
                    </TableCell>
                    <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <PaginationControls page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} total={data?.total ?? 0} onPageChange={setPage} />
      </div>
    </div>
  );
}

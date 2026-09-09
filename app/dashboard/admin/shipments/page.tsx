"use client";

import { AppInput } from "@/components/shared/app-input";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaginationControls, TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatNaira } from "@/lib/format";
import { PAYMENT_STATUS, SHIPMENT_STATUS } from "@/lib/statuses";
import { buildQuery } from "@/lib/utils";
import { displayName, type AdminShipment, type PaginatedResponse } from "@/types/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COLUMNS = 7;

export default function AdminShipmentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedSearch = useDebounce(search);

  const query = buildQuery({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
  });

  const { data, isFetching } = useGetData<PaginatedResponse<AdminShipment>>({ url: API_ENDPOINTS.admin.shipments.list(query) });
  const shipments = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Shipments" description="Every booking on the platform." />

      <div className="mb-4 flex flex-wrap gap-3">
        <AppInput
          type="search"
          placeholder="Search by reference"
          containerClassName="max-w-xs"
          value={search}
          onChange={event => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <AppSimpleSelect
          containerClassName="w-52"
          value={status}
          onValueChange={value => {
            setStatus(value);
            setPage(1);
          }}
          options={[{ label: "All statuses", value: "all" }, ...Object.entries(SHIPMENT_STATUS).map(([value, presentation]) => ({ label: presentation.label, value }))]}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && shipments.length === 0 ? (
              <TableSkeletonRows columns={COLUMNS} />
            ) : shipments.length === 0 ? (
              <TableEmptyRow columns={COLUMNS} message="No shipments match this view." />
            ) : (
              shipments.map(shipment => {
                const shipmentStatus = SHIPMENT_STATUS[shipment.status];
                const paymentStatus = PAYMENT_STATUS[shipment.payment_status];
                return (
                  <TableRow key={shipment.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/admin/shipments/${shipment.id}`)}>
                    <TableCell className="font-mono text-xs font-medium">{shipment.reference}</TableCell>
                    <TableCell>{displayName(shipment.user)}</TableCell>
                    <TableCell>
                      {shipment.origin.city} → {shipment.destination.city}
                    </TableCell>
                    <TableCell className="font-semibold">{formatNaira(shipment.amount_minor)}</TableCell>
                    <TableCell>
                      <StatusBadge label={paymentStatus.label} className={paymentStatus.className} />
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

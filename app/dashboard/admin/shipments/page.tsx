"use client";

import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { PageHeader } from "@/components/shared/page-header";
import { RouteText } from "@/components/shared/route-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableCard, TableSearch, TOOLBAR_SELECT_CLASS } from "@/components/shared/table-card";
import { PaginationControls, TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatNaira } from "@/lib/format";
import { PAYMENT_STATUS, SHIPMENT_STATUS } from "@/lib/statuses";
import { buildQuery } from "@/lib/utils";
import { displayName, type AdminShipment, type PaginatedResponse } from "@/types/admin";
import { Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const COLUMNS = 7;

function AdminShipmentsPageContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedSearch = useDebounce(search);
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search");
  const statusParam = searchParams.get("status");

  // The topbar search and overview queue links arrive as query params.
  useEffect(() => {
    if (searchParam !== null) setSearch(searchParam);
    if (statusParam !== null) setStatus(statusParam);
    setPage(1);
  }, [searchParam, statusParam]);

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

      <TableCard
        toolbar={
          <>
            <TableSearch
              placeholder="Search by reference"
              value={search}
              onChange={event => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
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
          </>
        }
        footer={<PaginationControls page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} total={data?.total ?? 0} onPageChange={setPage} />}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && shipments.length === 0 ? (
              <TableSkeletonRows columns={COLUMNS} />
            ) : shipments.length === 0 ? (
              <TableEmptyRow columns={COLUMNS} icon={Package} message="No shipments match this view." />
            ) : (
              shipments.map(shipment => {
                const shipmentStatus = SHIPMENT_STATUS[shipment.status];
                const paymentStatus = PAYMENT_STATUS[shipment.payment_status];
                return (
                  <TableRow key={shipment.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/admin/shipments/${shipment.id}`)}>
                    <TableCell className="font-mono text-[12.5px] font-semibold">{shipment.reference}</TableCell>
                    <TableCell>{displayName(shipment.user)}</TableCell>
                    <TableCell>
                      <RouteText from={shipment.origin.city} to={shipment.destination.city} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatNaira(shipment.amount_minor)}</TableCell>
                    <TableCell>
                      <StatusBadge label={paymentStatus.label} className={paymentStatus.className} />
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
      </TableCard>
    </div>
  );
}

export default function AdminShipmentsPage() {
  return (
    <Suspense>
      <AdminShipmentsPageContent />
    </Suspense>
  );
}

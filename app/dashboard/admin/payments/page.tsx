"use client";

import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableCard, TableSearch, TOOLBAR_SELECT_CLASS } from "@/components/shared/table-card";
import { PaginationControls, TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime, formatNaira } from "@/lib/format";
import { PAYMENT_PROOF_STATUS, PAYMENT_STATUS } from "@/lib/statuses";
import { buildQuery } from "@/lib/utils";
import { displayName, type AdminPaymentRow, type PaginatedResponse, type PaymentsSummary } from "@/types/admin";
import Cookies from "js-cookie";
import { BadgeCheck, Clock, ExternalLink, Landmark, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MarkRefundedDialog } from "./_components/mark-refunded-dialog";

const COLUMNS = 7;

const FILTERS = [
  { label: "All payments", value: "all" },
  { label: "Awaiting review", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Refund due", value: "REFUND_DUE" },
  { label: "Refunded", value: "REFUNDED" },
];

const totalHint = (count: number | undefined, noun: string) => (count === undefined ? undefined : `${count.toLocaleString()} ${noun}${count === 1 ? "" : "s"}`);

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [refunding, setRefunding] = useState<AdminPaymentRow | null>(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    if (Cookies.get("session_type") !== "SUPER_ADMIN") {
      router.replace("/dashboard/admin/shipments");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSuperAdmin(true);
  }, [router]);

  const query = buildQuery({
    page,
    limit: 15,
    search: debouncedSearch || undefined,
    status: filter === "all" || filter === "REFUND_DUE" ? undefined : filter,
    refund_due: filter === "REFUND_DUE" ? "true" : undefined,
  });
  const listUrl = API_ENDPOINTS.admin.payments.list(query);

  const { data, isFetching } = useGetData<PaginatedResponse<AdminPaymentRow> & { summary: PaymentsSummary }>({ url: listUrl, shouldFetch: isSuperAdmin });
  const payments = data?.data ?? [];
  const summary = data?.summary;

  if (!isSuperAdmin) return null;

  return (
    <div>
      <PageHeader title="Payments" description="Every bank-transfer receipt, who reviewed it and every refund owed or sent." />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Confirmed" icon={BadgeCheck} value={summary ? formatNaira(summary.approved.amount_minor) : "-"} hint={totalHint(summary?.approved.count, "payment")} />
        <StatCard label="Awaiting review" icon={Clock} value={summary ? formatNaira(summary.pending.amount_minor) : "-"} hint={totalHint(summary?.pending.count, "receipt")} />
        <StatCard label="Refunds due" icon={Undo2} value={summary ? formatNaira(summary.refund_due.amount_minor) : "-"} hint={totalHint(summary?.refund_due.count, "shipment")} />
        <StatCard label="Refunded" icon={Landmark} value={summary ? formatNaira(summary.refunded.amount_minor) : "-"} hint={summary ? `${summary.rejected.count.toLocaleString()} receipts rejected` : undefined} />
      </div>

      <TableCard
        toolbar={
          <>
            <TableSearch
              placeholder="Search reference, email or payer"
              value={search}
              onChange={event => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <AppSimpleSelect
              containerClassName="w-full sm:w-52"
              className={TOOLBAR_SELECT_CLASS}
              value={filter}
              onValueChange={value => {
                setFilter(value);
                setPage(1);
              }}
              options={FILTERS}
            />
          </>
        }
        footer={<PaginationControls page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} total={data?.total ?? 0} onPageChange={setPage} />}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewed by</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && payments.length === 0 ? (
              <TableSkeletonRows columns={COLUMNS} />
            ) : payments.length === 0 ? (
              <TableEmptyRow columns={COLUMNS} icon={Landmark} title="No payments here" message="Receipts customers upload show up here once they pay by bank transfer." />
            ) : (
              payments.map(payment => {
                const isRefundDue = payment.status === "APPROVED" && payment.shipment.payment_status === "REFUND_DUE";
                const status = isRefundDue ? PAYMENT_STATUS.REFUND_DUE : PAYMENT_PROOF_STATUS[payment.status];
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Link href={`/dashboard/admin/shipments/${payment.shipment.id}`} className="font-mono text-[12.5px] font-medium text-brand hover:underline">
                        {payment.shipment.reference}
                      </Link>
                      <p className="max-w-52 truncate text-xs text-foreground-muted">
                        {displayName(payment.user)}
                        {payment.payer_name ? ` · paid by ${payment.payer_name}` : ""}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatNaira(payment.amount_minor)}</TableCell>
                    <TableCell>
                      <StatusBadge label={status.label} className={status.className} />
                    </TableCell>
                    <TableCell>
                      {payment.reviewedBy ? (
                        <>
                          <p className="text-[13px] font-medium text-foreground">{displayName(payment.reviewedBy)}</p>
                          <p className="text-xs text-foreground-muted">{payment.reviewedAt ? formatDateTime(payment.reviewedAt) : ""}</p>
                          {payment.refundedBy && <p className="text-xs text-foreground-muted">Refunded by {displayName(payment.refundedBy)}</p>}
                        </>
                      ) : (
                        <span className="text-foreground-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground-muted">{formatDateTime(payment.createdAt)}</TableCell>
                    <TableCell>
                      <a href={payment.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline">
                        View
                        <ExternalLink className="size-3.5" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      {isRefundDue && (
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setRefunding(payment)}>
                          Mark refunded
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableCard>

      <MarkRefundedDialog payment={refunding} onClose={() => setRefunding(null)} />
    </div>
  );
}

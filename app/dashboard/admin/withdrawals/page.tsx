"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaginationControls, TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime, formatNaira } from "@/lib/format";
import { showToast } from "@/lib/show-toast";
import { WITHDRAWAL_STATUS } from "@/lib/statuses";
import { buildQuery } from "@/lib/utils";
import { displayName, type PaginatedResponse, type Withdrawal } from "@/types/admin";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const COLUMNS = 6;

export default function AdminWithdrawalsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("PENDING");
  const [approving, setApproving] = useState<Withdrawal | null>(null);
  const [rejecting, setRejecting] = useState<Withdrawal | null>(null);
  const [reason, setReason] = useState("");

  const query = buildQuery({ page, limit: 10, status: status === "all" ? undefined : status });
  const listUrl = API_ENDPOINTS.admin.withdrawals.list(query);

  const { data, isFetching } = useGetData<PaginatedResponse<Withdrawal>>({ url: listUrl });
  const withdrawals = data?.data ?? [];

  const { mutate: decide, isPending } = useSubmitData<{ id: string; decision: "APPROVE" | "REJECT"; reason?: string }, unknown>({
    url: variables => API_ENDPOINTS.admin.withdrawals.decide(variables.id),
    getBody: variables => ({ decision: variables.decision, reason: variables.reason }),
    onSuccessMessage: "Decision recorded",
    additionalQueryKeys: [[listUrl]],
    onSuccess: () => {
      setApproving(null);
      setRejecting(null);
      setReason("");
    },
  });

  const handleReject = function () {
    if (!rejecting) return;
    if (reason.trim().length < 5) return showToast("warning", "Give the customer an actionable reason");
    decide({ id: rejecting.id, decision: "REJECT", reason: reason.trim() });
  };

  return (
    <div>
      <PageHeader title="Withdrawals" description="Approving a withdrawal sends the bank transfer immediately." />

      <div className="mb-4">
        <Select
          value={status}
          onValueChange={value => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All withdrawals</SelectItem>
            {Object.entries(WITHDRAWAL_STATUS).map(([value, presentation]) => (
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
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && withdrawals.length === 0 ? (
              <TableSkeletonRows columns={COLUMNS} />
            ) : withdrawals.length === 0 ? (
              <TableEmptyRow columns={COLUMNS} message="Nothing in this queue." />
            ) : (
              withdrawals.map(withdrawal => {
                const presentation = WITHDRAWAL_STATUS[withdrawal.status];
                return (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">{displayName(withdrawal.user)}</TableCell>
                    <TableCell className="font-semibold">{formatNaira(withdrawal.amount_minor)}</TableCell>
                    <TableCell>
                      <p className="text-sm">{withdrawal.account_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {withdrawal.bank_name} · {withdrawal.account_number}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge label={presentation.label} className={presentation.className} />
                      {withdrawal.rejection_reason && <p className="mt-1 max-w-44 text-xs text-muted-foreground">{withdrawal.rejection_reason}</p>}
                    </TableCell>
                    <TableCell>{formatDateTime(withdrawal.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {withdrawal.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => setApproving(withdrawal)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setRejecting(withdrawal)}>
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <PaginationControls page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} total={data?.total ?? 0} onPageChange={setPage} />
      </div>

      <Dialog open={!!approving} onOpenChange={isOpen => !isOpen && setApproving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve this withdrawal?</DialogTitle>
            <DialogDescription>{approving && `${formatNaira(approving.amount_minor)} is transferred to ${approving.account_name} (${approving.bank_name} · ${approving.account_number}) immediately.`}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApproving(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={() => approving && decide({ id: approving.id, decision: "APPROVE" })} disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Approve & transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejecting} onOpenChange={isOpen => !isOpen && setRejecting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject this withdrawal?</DialogTitle>
            <DialogDescription>The amount is refunded to the customer's wallet and the reason is shown to them.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="e.g. The account name doesn't match your profile." value={reason} onChange={event => setReason(event.target.value)} maxLength={300} />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejecting(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Reject & refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime, formatNaira } from "@/lib/format";
import { ACCOUNT_STATUS, KYC_STATUS } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import { displayName, type AdminUserDetail, type PaginatedResponse, type WalletTransaction } from "@/types/admin";
import type { APIResponse } from "@/types/response";
import { useParams } from "next/navigation";
import { useState } from "react";
import { WalletAdjustDialog } from "./_components/wallet-adjust-dialog";

const InfoRow = function ({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
};

export default function AdminUserDetailPage() {
  const { userId = "" } = useParams<{ userId: string }>();
  const [isConfirmingStatus, setIsConfirmingStatus] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const { data, isFetching } = useGetData<APIResponse<AdminUserDetail>>({ url: API_ENDPOINTS.admin.users.detail(userId) });
  const user = data?.data;

  const { data: transactionsData, isFetching: isFetchingTransactions } = useGetData<PaginatedResponse<WalletTransaction>>({
    url: API_ENDPOINTS.admin.users.walletTransactions(userId),
    shouldFetch: !!user,
  });
  const transactions = transactionsData?.data ?? [];

  const isSuspended = user?.account_status === "SUSPENDED";

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useSubmitData<{ account_status: string }, unknown>({
    url: API_ENDPOINTS.admin.users.updateStatus(userId),
    method: "patch",
    onSuccessMessage: isSuspended ? "Account reinstated" : "Account suspended",
    additionalQueryKeys: [[API_ENDPOINTS.admin.users.detail(userId)]],
    onSuccess: () => setIsConfirmingStatus(false),
  });

  if (isFetching && !user) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!user) return null;

  const accountStatus = ACCOUNT_STATUS[user.account_status];
  const kycStatus = user.kyc ? KYC_STATUS[user.kyc.status] : null;

  return (
    <div>
      <PageHeader
        title={displayName(user)}
        description={user.email}
        action={
          user.account_status !== "DEACTIVATED" ? (
            <Button variant={isSuspended ? "default" : "destructive"} onClick={() => setIsConfirmingStatus(true)}>
              {isSuspended ? "Reinstate account" : "Suspend account"}
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold text-foreground">Profile</p>
          <div className="mt-2 divide-y divide-line">
            <InfoRow label="Status" value={<StatusBadge label={accountStatus.label} className={accountStatus.className} />} />
            <InfoRow label="Phone" value={user.phone_no ?? "—"} />
            <InfoRow label="Email verified" value={user.has_validated_email ? "Yes" : "No"} />
            <InfoRow label="Location" value={[user.city, user.state, user.country].filter(Boolean).join(", ") || "—"} />
            <InfoRow label="Last login" value={user.lastLogin ? formatDateTime(user.lastLogin) : "Never"} />
            <InfoRow label="Joined" value={formatDateTime(user.createdAt)} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Wallet</p>
            <Button variant="outline" size="sm" onClick={() => setIsAdjustOpen(true)}>
              Adjust
            </Button>
          </div>
          <p className="mt-3 text-3xl font-bold text-brand">{formatNaira(user.wallet?.available_minor ?? 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Available balance</p>

          <p className="mt-6 text-sm font-semibold text-foreground">KYC</p>
          <div className="mt-2 divide-y divide-line">
            <InfoRow label="Status" value={kycStatus ? <StatusBadge label={kycStatus.label} className={kycStatus.className} /> : "Not submitted"} />
            {user.kyc && (
              <>
                <InfoRow label="Identity" value={`${user.kyc.identity_type} · ${user.kyc.identity_number}`} />
                <InfoRow label="Submitted" value={formatDateTime(user.kyc.submittedAt)} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
        <p className="border-b border-line px-5 py-4 text-sm font-semibold text-foreground">Wallet transactions</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Narration</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetchingTransactions && transactions.length === 0 ? (
              <TableSkeletonRows columns={5} />
            ) : transactions.length === 0 ? (
              <TableEmptyRow columns={5} message="No transactions yet." />
            ) : (
              transactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium capitalize">{transaction.type.toLowerCase().replaceAll("_", " ")}</TableCell>
                  <TableCell className={cn("font-semibold", transaction.amount_minor > 0 ? "text-emerald" : "text-danger")}>
                    {transaction.amount_minor > 0 ? "+" : ""}
                    {formatNaira(transaction.amount_minor)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{transaction.reference}</TableCell>
                  <TableCell className="max-w-56 truncate">{transaction.narration ?? "—"}</TableCell>
                  <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={isConfirmingStatus}
        title={isSuspended ? "Reinstate this account?" : "Suspend this account?"}
        description={isSuspended ? "The customer will be able to sign in and use the platform again." : "The customer is signed out immediately and cannot sign in until reinstated."}
        confirmLabel={isSuspended ? "Reinstate" : "Suspend"}
        isDestructive={!isSuspended}
        isLoading={isUpdatingStatus}
        onConfirm={() => updateStatus({ account_status: isSuspended ? "ACTIVE" : "SUSPENDED" })}
        onCancel={() => setIsConfirmingStatus(false)}
      />

      <WalletAdjustDialog userId={userId} open={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} />
    </div>
  );
}

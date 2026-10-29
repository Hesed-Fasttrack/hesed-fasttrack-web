"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableCard } from "@/components/shared/table-card";
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
import { ReceiptText } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { WalletAdjustDialog } from "./_components/wallet-adjust-dialog";

const InfoRow = function ({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-[13px]">
      <span className="shrink-0 text-foreground-muted">{label}</span>
      <span className="min-w-0 text-right font-medium break-words text-foreground">{value}</span>
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
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!user) return null;

  const accountStatus = ACCOUNT_STATUS[user.account_status];
  const kycStatus = user.kyc ? KYC_STATUS[user.kyc.status] : null;

  return (
    <div>
      <PageHeader
        backHref="/dashboard/admin/users"
        title={displayName(user)}
        description={user.email}
        action={
          user.account_status !== "DEACTIVATED" ? (
            <Button variant={isSuspended ? "default" : "destructive"} className="h-10 w-full rounded-xl px-4 sm:w-auto" onClick={() => setIsConfirmingStatus(true)}>
              {isSuspended ? "Reinstate account" : "Suspend account"}
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <SectionCard title="Profile" action={<StatusBadge label={accountStatus.label} className={accountStatus.className} />}>
          <div className="divide-y divide-line px-5 sm:px-5.5">
            <InfoRow label="Phone" value={user.phone_no ?? "-"} />
            <InfoRow label="Email verified" value={user.has_validated_email ? "Yes" : "No"} />
            <InfoRow label="Location" value={[user.city, user.state, user.country].filter(Boolean).join(", ") || "-"} />
            <InfoRow label="Last login" value={user.lastLogin ? formatDateTime(user.lastLogin) : "Never"} />
            <InfoRow label="Joined" value={formatDateTime(user.createdAt)} />
          </div>
        </SectionCard>

        <div className="flex min-w-0 flex-col gap-5">
          <section className="rounded-2xl border border-line bg-white p-5 sm:p-5.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-medium text-foreground-muted">Wallet balance</p>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setIsAdjustOpen(true)}>
                Adjust
              </Button>
            </div>
            <p className="mt-1.5 text-[28px] font-extrabold tracking-tight text-foreground tabular-nums">{formatNaira(user.wallet?.available_minor ?? 0)}</p>
            <p className="mt-0.5 text-[12.5px] text-foreground-muted">Available balance</p>
          </section>

          <SectionCard title="KYC" action={kycStatus ? <StatusBadge label={kycStatus.label} className={kycStatus.className} /> : undefined}>
            {user.kyc ? (
              <div className="divide-y divide-line px-5 sm:px-5.5">
                <InfoRow label="Identity" value={`${user.kyc.identity_type} · ${user.kyc.identity_number}`} />
                <InfoRow label="Submitted" value={formatDateTime(user.kyc.submittedAt)} />
              </div>
            ) : (
              <p className="p-5 text-[13px] text-foreground-muted sm:p-5.5">Not submitted</p>
            )}
          </SectionCard>
        </div>
      </div>

      <TableCard title="Wallet transactions" className="mt-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Narration</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetchingTransactions && transactions.length === 0 ? (
              <TableSkeletonRows columns={5} />
            ) : transactions.length === 0 ? (
              <TableEmptyRow columns={5} icon={ReceiptText} title="No transactions yet" message="Wallet funding, payments and refunds show up here." compact />
            ) : (
              transactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium capitalize">{transaction.type.toLowerCase().replaceAll("_", " ")}</TableCell>
                  <TableCell className={cn("text-right font-semibold tabular-nums", transaction.amount_minor > 0 ? "text-emerald" : "text-danger")}>
                    {transaction.amount_minor > 0 ? "+" : ""}
                    {formatNaira(transaction.amount_minor)}
                  </TableCell>
                  <TableCell className="font-mono text-[12.5px]">{transaction.reference}</TableCell>
                  <TableCell className="max-w-56 truncate text-foreground-muted">{transaction.narration ?? "-"}</TableCell>
                  <TableCell className="text-foreground-muted">{formatDateTime(transaction.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableCard>

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

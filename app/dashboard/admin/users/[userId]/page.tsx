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
import { ACCOUNT_STATUS, KYC_STATUS, PAYMENT_PROOF_STATUS } from "@/lib/statuses";
import { displayName, type AdminPaymentRow, type AdminUserDetail, type PaginatedResponse } from "@/types/admin";
import type { APIResponse } from "@/types/response";
import { ReceiptText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

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

  const { data, isFetching } = useGetData<APIResponse<AdminUserDetail>>({ url: API_ENDPOINTS.admin.users.detail(userId) });
  const user = data?.data;

  const { data: paymentsData, isFetching: isFetchingPayments } = useGetData<PaginatedResponse<AdminPaymentRow>>({
    url: API_ENDPOINTS.admin.payments.list(`?user_id=${userId}&limit=20`),
    shouldFetch: !!user,
  });
  const payments = paymentsData?.data ?? [];

  const isSuspended = user?.account_status === "SUSPENDED";

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useSubmitData<{ account_status: string }, unknown>({
    url: API_ENDPOINTS.admin.users.updateStatus(userId),
    method: "patch",
    onSuccessMessage: isSuspended ? "Account reinstated" : "Account suspended",
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

      <TableCard title="Payments" className="mt-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewed by</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetchingPayments && payments.length === 0 ? (
              <TableSkeletonRows columns={5} />
            ) : payments.length === 0 ? (
              <TableEmptyRow columns={5} icon={ReceiptText} title="No payments yet" message="Bank-transfer receipts this customer uploads show up here." compact />
            ) : (
              payments.map(payment => {
                const status = PAYMENT_PROOF_STATUS[payment.status];
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Link href={`/dashboard/admin/shipments/${payment.shipment.id}`} className="font-mono text-[12.5px] font-medium text-brand hover:underline">
                        {payment.shipment.reference}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatNaira(payment.amount_minor)}</TableCell>
                    <TableCell>
                      <StatusBadge label={status.label} className={status.className} />
                    </TableCell>
                    <TableCell className="text-foreground-muted">{payment.reviewedBy ? displayName(payment.reviewedBy) : "-"}</TableCell>
                    <TableCell className="text-foreground-muted">{formatDateTime(payment.createdAt)}</TableCell>
                  </TableRow>
                );
              })
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

    </div>
  );
}

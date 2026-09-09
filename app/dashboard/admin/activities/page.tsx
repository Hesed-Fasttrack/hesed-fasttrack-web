"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaginationControls, TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime } from "@/lib/format";
import { buildQuery } from "@/lib/utils";
import { displayName, type AdminActivity, type PaginatedResponse } from "@/types/admin";
import { useState } from "react";

const COLUMNS = 4;

const ACTION_LABELS: Record<string, string> = {
  SHIPMENT_TRANSITION: "Shipment status",
  SHIPMENT_EDIT: "Shipment edit",
  KYC_REVIEW: "KYC review",
  WALLET_ADJUST: "Wallet adjustment",
  WITHDRAWAL_DECIDE: "Withdrawal decision",
  USER_STATUS: "Account status",
  ADMIN_CREATE: "Admin created",
  ADMIN_STATUS: "Admin status",
  ADMIN_REMOVE: "Admin removed",
};

export default function AdminActivitiesPage() {
  const [page, setPage] = useState(1);

  const query = buildQuery({ page, limit: 15 });
  const { data, isFetching } = useGetData<PaginatedResponse<AdminActivity>>({ url: API_ENDPOINTS.admin.activities.list(query) });
  const activities = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Activity" description="Everything your admins have done, newest first." />

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && activities.length === 0 ? (
              <TableSkeletonRows columns={COLUMNS} />
            ) : activities.length === 0 ? (
              <TableEmptyRow columns={COLUMNS} message="No admin activity recorded yet." />
            ) : (
              activities.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{displayName(activity.actor)}</p>
                    <p className="text-xs text-muted-foreground">{activity.actor.email}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={ACTION_LABELS[activity.action] ?? activity.action} className="bg-brand-muted text-brand" />
                  </TableCell>
                  <TableCell className="max-w-md">{activity.summary}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDateTime(activity.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <PaginationControls page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} total={data?.total ?? 0} onPageChange={setPage} />
      </div>
    </div>
  );
}

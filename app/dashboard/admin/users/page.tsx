"use client";

import { AppInput } from "@/components/shared/app-input";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaginationControls, TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/format";
import { ACCOUNT_STATUS } from "@/lib/statuses";
import { buildQuery } from "@/lib/utils";
import { displayName, type AdminUserRow, type PaginatedResponse } from "@/types/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COLUMNS = 6;

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedSearch = useDebounce(search);

  const query = buildQuery({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    account_status: status === "all" ? undefined : status,
  });

  const { data, isFetching } = useGetData<PaginatedResponse<AdminUserRow>>({ url: API_ENDPOINTS.admin.users.list(query) });
  const users = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Users" description="Every customer on the platform." />

      <div className="mb-4 flex flex-wrap gap-3">
        <AppInput
          type="search"
          placeholder="Search name, email or phone"
          containerClassName="max-w-xs"
          value={search}
          onChange={event => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select
          value={status}
          onValueChange={value => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && users.length === 0 ? (
              <TableSkeletonRows columns={COLUMNS} />
            ) : users.length === 0 ? (
              <TableEmptyRow columns={COLUMNS} message="No users match this view." />
            ) : (
              users.map(user => {
                const status = ACCOUNT_STATUS[user.account_status];
                return (
                  <TableRow key={user.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}>
                    <TableCell className="font-medium">{displayName(user)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_no ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge label={status.label} className={status.className} />
                    </TableCell>
                    <TableCell>{user.has_validated_email ? "Yes" : "No"}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
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

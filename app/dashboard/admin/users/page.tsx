"use client";

import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  TableCard,
  TableSearch,
  TOOLBAR_SELECT_CLASS,
} from "@/components/shared/table-card";
import {
  PaginationControls,
  TableEmptyRow,
  TableSkeletonRows,
} from "@/components/shared/table-helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/format";
import { ACCOUNT_STATUS } from "@/lib/statuses";
import { buildQuery } from "@/lib/utils";
import {
  displayName,
  type AdminUserRow,
  type PaginatedResponse,
} from "@/types/admin";
import { BadgeCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COLUMNS = 6;

const initialsOf = (user: AdminUserRow) =>
  `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() ||
  user.email[0]?.toUpperCase() ||
  "·";

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

  const { data, isFetching } = useGetData<PaginatedResponse<AdminUserRow>>({
    url: API_ENDPOINTS.admin.users.list(query),
  });
  const users = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Users" description="Every customer on the platform." />

      <TableCard
        toolbar={
          <>
            <TableSearch
              placeholder="Search name, email or phone"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <AppSimpleSelect
              containerClassName="w-full sm:w-52"
              className={TOOLBAR_SELECT_CLASS}
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={[
                { label: "All statuses", value: "all" },
                { label: "Active", value: "ACTIVE" },
                { label: "Suspended", value: "SUSPENDED" },
                { label: "Deactivated", value: "DEACTIVATED" },
              ]}
            />
          </>
        }
        footer={
          <PaginationControls
            page={data?.page ?? 1}
            totalPages={data?.totalPages ?? 1}
            total={data?.total ?? 0}
            onPageChange={setPage}
          />
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email verified</TableHead>
              <TableHead>Last sign-in</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && users.length === 0 ? (
              <TableSkeletonRows columns={COLUMNS} />
            ) : users.length === 0 ? (
              <TableEmptyRow
                columns={COLUMNS}
                icon={Users}
                message="No users match this view."
              />
            ) : (
              users.map((user) => {
                const status = ACCOUNT_STATUS[user.account_status];
                return (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/admin/users/${user.id}`)
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-bold text-foreground-muted">
                          {initialsOf(user)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium">{displayName(user)}</p>
                          <p className="text-xs text-foreground-muted">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground-muted tabular-nums">
                      {user.phone_no ?? "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={status.label}
                        className={status.className}
                      />
                    </TableCell>
                    <TableCell>
                      {user.has_validated_email ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald">
                          <BadgeCheck className="size-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-foreground-muted">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground-muted">
                      {user.lastLogin ? formatDate(user.lastLogin) : "-"}
                    </TableCell>
                    <TableCell className="text-foreground-muted">
                      {formatDate(user.createdAt)}
                    </TableCell>
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

"use client";

import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  TableCard,
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
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime } from "@/lib/format";
import { KYC_STATUS } from "@/lib/statuses";
import { buildQuery } from "@/lib/utils";
import {
  displayName,
  type KycSubmission,
  type PaginatedResponse,
} from "@/types/admin";
import { IdCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COLUMNS = 6;

const IDENTITY_LABELS = {
  NIN: "NIN",
  DRIVERS_LICENCE: "Driver's licence",
  INTL_PASSPORT: "Int'l passport",
} as const;

export default function AdminKycPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("PENDING");

  const query = buildQuery({
    page,
    limit: 10,
    status: status === "all" ? undefined : status,
  });

  const { data, isFetching } = useGetData<PaginatedResponse<KycSubmission>>({
    url: API_ENDPOINTS.admin.kyc.list(query),
  });
  const submissions = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="KYC queue"
        description="Identity submissions, oldest first."
      />

      <TableCard
        title="Submissions"
        description="Open one to review each document."
        toolbar={
          <AppSimpleSelect
            containerClassName="w-full sm:w-52"
            className={TOOLBAR_SELECT_CLASS}
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { label: "All submissions", value: "all" },
              { label: "Pending review", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
            ]}
          />
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
              <TableHead>Identity</TableHead>
              <TableHead>Identity status</TableHead>
              <TableHead>Address status</TableHead>
              <TableHead>Overall</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && submissions.length === 0 ? (
              <TableSkeletonRows columns={COLUMNS} />
            ) : submissions.length === 0 ? (
              <TableEmptyRow
                columns={COLUMNS}
                icon={IdCard}
                message="Nothing in this queue."
              />
            ) : (
              submissions.map((submission) => {
                const identity = KYC_STATUS[submission.identity_status];
                const address = KYC_STATUS[submission.address_status];
                const overall = KYC_STATUS[submission.status];
                return (
                  <TableRow
                    key={submission.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/admin/kyc/${submission.id}`)
                    }
                  >
                    <TableCell>
                      <p className="font-medium">
                        {displayName(submission.user)}
                      </p>
                      {submission.user?.email && (
                        <p className="text-xs text-foreground-muted">
                          {submission.user.email}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {IDENTITY_LABELS[submission.identity_type]}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={identity.label}
                        className={identity.className}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={address.label}
                        className={address.className}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={overall.label}
                        className={overall.className}
                      />
                    </TableCell>
                    <TableCell className="text-foreground-muted">
                      {formatDateTime(submission.submittedAt)}
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

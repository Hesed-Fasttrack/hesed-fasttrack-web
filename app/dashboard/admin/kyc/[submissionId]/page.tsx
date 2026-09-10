"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime } from "@/lib/format";
import { KYC_STATUS } from "@/lib/statuses";
import { displayName, type KycSubmission } from "@/types/admin";
import type { APIResponse } from "@/types/response";
import { useParams } from "next/navigation";
import { KycDocumentCard } from "./_components/kyc-document-card";

const IDENTITY_LABELS = {
  NIN: "NIN",
  DRIVERS_LICENCE: "Driver's licence",
  INTL_PASSPORT: "International passport",
} as const;

export default function AdminKycDetailPage() {
  const { submissionId = "" } = useParams<{ submissionId: string }>();

  const { data, isFetching } = useGetData<APIResponse<KycSubmission>>({ url: API_ENDPOINTS.admin.kyc.detail(submissionId) });
  const submission = data?.data;

  if (isFetching && !submission) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!submission) return null;

  const overall = KYC_STATUS[submission.status];

  return (
    <div>
      <PageHeader
        backHref="/dashboard/admin/kyc"
        title={displayName(submission.user)}
        description={`${IDENTITY_LABELS[submission.identity_type]} · ${submission.identity_number} — submitted ${formatDateTime(submission.submittedAt)}`}
        action={<StatusBadge label={overall.label} className={overall.className} />}
      />

      <p className="mb-4 text-sm text-muted-foreground">Approval needs both documents. One rejection settles the submission — the customer resubmits only the rejected document.</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <KycDocumentCard submissionId={submission.id} document="identity" title="Identity document" imageUrl={submission.identity_document_url} status={submission.identity_status} rejectionReason={submission.identity_rejection_reason} />
        <KycDocumentCard submissionId={submission.id} document="address" title="Proof of address" imageUrl={submission.address_proof_url} status={submission.address_status} rejectionReason={submission.address_rejection_reason} />
      </div>
    </div>
  );
}

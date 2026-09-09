"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { CustomerKycSubmission } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { KycForm, KycStatusBanner } from "./_components/kyc-form";

export default function CustomerKycPage() {
  const { data, isFetching } = useGetData<APIResponse<CustomerKycSubmission | null>>({ url: API_ENDPOINTS.customer.kyc.status });
  const submission = data?.data ?? null;

  const showForm = !submission || submission.status === "REJECTED";

  return (
    <div>
      <PageHeader title="Identity verification" description="Verify once to pay for shipments and withdraw from your wallet." />

      {isFetching && !data ? (
        <Skeleton className="h-72 max-w-xl rounded-2xl" />
      ) : (
        <div className="space-y-4">
          {submission && <KycStatusBanner submission={submission} />}
          {showForm && <KycForm submission={submission} />}
        </div>
      )}
    </div>
  );
}

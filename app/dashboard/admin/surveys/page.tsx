"use client";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/table-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime } from "@/lib/format";
import type { PaginatedResponse } from "@/types/admin";
import { displayName } from "@/types/admin";
import {
  SURVEY_FREQUENCIES,
  type SurveyResponse,
  type SurveySummary,
} from "@/types/customer";
import Cookies from "js-cookie";
import {
  Gauge,
  MessageSquareHeart,
  PackageCheck,
  Star,
  ThumbsUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const rating = (value: number | null | undefined, max = 5) =>
  value == null ? "-" : `${value.toFixed(1)} / ${max}`;

export default function AdminSurveysPage() {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (Cookies.get("session_type") !== "SUPER_ADMIN") {
      router.replace("/dashboard/admin/shipments");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSuperAdmin(true);
  }, [router]);

  const { data, isFetching } = useGetData<
    PaginatedResponse<SurveyResponse> & { summary: SurveySummary }
  >({
    url: API_ENDPOINTS.admin.surveys.list("?page=1&limit=50"),
    shouldFetch: isSuperAdmin,
  });
  const responses = data?.data ?? [];
  const summary = data?.summary;

  if (!isSuperAdmin) return null;

  return (
    <div>
      <PageHeader
        title="Survey responses"
        description="What customers say about the service. Every submission, newest first."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-5">
        <StatCard
          label="Responses"
          value={String(summary?.total ?? "-")}
          icon={MessageSquareHeart}
        />
        <StatCard
          label="Overall satisfaction"
          value={rating(summary?.avg_satisfaction)}
          icon={Star}
        />
        <StatCard
          label="Booking ease"
          value={rating(summary?.avg_booking_ease)}
          icon={Gauge}
        />
        <StatCard
          label="Delivery"
          value={rating(summary?.avg_delivery)}
          icon={PackageCheck}
        />
        <StatCard
          label="Avg. NPS"
          value={rating(summary?.avg_nps, 10)}
          icon={ThumbsUp}
        />
      </div>

      <SectionCard
        title="Responses"
        description="Every submission, newest first."
      >
        {isFetching && responses.length === 0 ? (
          <div className="space-y-3 p-5.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : responses.length === 0 ? (
          <EmptyState
            icon={MessageSquareHeart}
            message="No survey responses yet. Customers see the survey prompt on their dashboard until they take it."
          />
        ) : (
          <ul className="divide-y divide-line">
            {responses.map((response) => (
              <li key={response.id} className="px-5 py-4.5 sm:px-5.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[13.5px] font-semibold text-foreground">
                      {response.user ? displayName(response.user) : "Customer"}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {response.user?.email} ·{" "}
                      {formatDateTime(response.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground-muted">
                    {SURVEY_FREQUENCIES.find(
                      (entry) => entry.value === response.frequency,
                    )?.label ?? response.frequency}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span className="text-foreground-muted">
                    Satisfaction{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {response.satisfaction}/5
                    </span>
                  </span>
                  <span className="text-foreground-muted">
                    Booking{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {response.booking_ease}/5
                    </span>
                  </span>
                  <span className="text-foreground-muted">
                    Delivery{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {response.delivery}/5
                    </span>
                  </span>
                  <span className="text-foreground-muted">
                    NPS{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {response.nps}/10
                    </span>
                  </span>
                </div>

                {response.improvements && (
                  <p className="mt-3 rounded-xl border-l-2 border-brand bg-canvas px-4 py-3 text-sm text-foreground">
                    “{response.improvements}”
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

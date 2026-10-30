"use client";

import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/table-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { AdminActivity, PaginatedResponse } from "@/types/admin";
import { formatDistanceToNowStrict } from "date-fns";
import { History } from "lucide-react";

export const TeamActivityCard = function () {
  const { data, isFetching } = useGetData<PaginatedResponse<AdminActivity>>({ url: API_ENDPOINTS.admin.activities.list("?page=1&limit=4") });
  const activities = data?.data ?? [];

  return (
    <SectionCard title="Team activity" link={{ href: "/dashboard/admin/activities", label: "All" }}>
      {isFetching && activities.length === 0 ? (
        <div className="space-y-3 p-5.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 rounded-xl" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState icon={History} title="No activity yet" message="Admin actions on shipments, KYC and payments show up here." compact />
      ) : (
        <ol className="px-5 py-1.5 sm:px-5.5">
          {activities.map((activity, index) => {
            const initials = `${activity.actor.first_name?.[0] ?? ""}${activity.actor.last_name?.[0] ?? ""}`.toUpperCase() || "·";

            return (
              <li key={activity.id} className="relative flex gap-3 py-3">
                {index < activities.length - 1 && <span aria-hidden className="absolute top-11.5 -bottom-1 left-3.75 w-px bg-line" />}
                <span className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-[11px] font-bold text-brand-dark">{initials}</span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">
                    {activity.actor.first_name ?? activity.actor.email}
                    <span className="ml-1.5 text-xs font-normal text-foreground-subtle">{formatDistanceToNowStrict(new Date(activity.createdAt), { addSuffix: true })}</span>
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-foreground-muted">{activity.summary}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SectionCard>
  );
};

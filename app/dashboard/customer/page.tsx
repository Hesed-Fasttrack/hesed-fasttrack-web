"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { useGetProfile } from "@/hooks/use-get-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { PaginatedResponse } from "@/types/admin";
import type { CustomerDashboardSummary, CustomerShipment } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { format } from "date-fns";
import { Calculator, PackagePlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ActiveShipmentCard } from "./_components/active-shipment-card";
import { OfficeCard, TrackCard, VerificationNote } from "./_components/overview-side-cards";
import { PaymentInfoCard } from "./_components/payment-info-card";
import { RecentShipmentsCard } from "./_components/recent-shipments-card";
import { SummaryStats } from "./_components/summary-stats";
import { SurveyPromptCard } from "./_components/survey-prompt-card";

const greetingFor = function (hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const describe = function (summary: CustomerDashboardSummary | undefined) {
  if (!summary) return "Ship, pay and track, all from here.";
  const moving = summary.on_the_move;
  const waiting = summary.awaiting_drop_off + summary.awaiting_pickup;
  if (moving === 0 && waiting === 0) return "Nothing in progress. Get a quote and book your next shipment in minutes.";
  const parts = [moving > 0 && `${moving} ${moving === 1 ? "shipment is" : "shipments are"} on the move`, waiting > 0 && `${waiting} waiting to be handed over`].filter(Boolean);
  return `${parts.join(" and ")}.`.replace(/^./, letter => letter.toUpperCase());
};

export default function CustomerOverviewPage() {
  const { profile } = useGetProfile();
  const [now, setNow] = useState<Date | null>(null);

  // The greeting depends on the viewer's clock, which only exists after hydration.
  useEffect(() => {
    setNow(new Date());
  }, []);

  const { data: summaryData, isFetching: isFetchingSummary } = useGetData<APIResponse<CustomerDashboardSummary>>({ url: API_ENDPOINTS.customer.dashboard.summary, staleTime: 60 * 1000 });
  const summary = summaryData?.data;

  const { data: shipmentsData, isFetching: isFetchingShipments } = useGetData<PaginatedResponse<CustomerShipment>>({
    url: API_ENDPOINTS.customer.shipments.list("?page=1&limit=5"),
  });

  const greeting = now ? greetingFor(now.getHours()) : "Hello";

  return (
    <div>
      <SurveyPromptCard />
      <PageHeader
        eyebrow={now ? format(now, "EEEE, d MMMM") : undefined}
        title={`${greeting}${profile?.first_name ? `, ${profile.first_name}` : ""}`}
        description={describe(summary)}
        action={
          <div className="flex w-full gap-2.5 sm:w-auto">
            <Button asChild variant="outline" className="h-10 flex-1 rounded-xl px-4 sm:flex-none">
              <Link href="/dashboard/customer/quick-quote">
                <Calculator />
                Quick quote
              </Link>
            </Button>
            <Button asChild className="h-10 flex-1 rounded-xl px-4 sm:flex-none">
              <Link href="/dashboard/customer/book">
                <PackagePlus />
                Book a shipment
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <ActiveShipmentCard shipments={summary?.open_shipments ?? []} isLoading={isFetchingSummary} />
        <PaymentInfoCard summary={summary} />
      </div>

      <div className="mt-5">
        <SummaryStats summary={summary} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <RecentShipmentsCard shipments={shipmentsData?.data ?? []} isLoading={isFetchingShipments} />
        <div className="flex flex-col gap-5">
          <TrackCard />
          <OfficeCard />
          <VerificationNote />
        </div>
      </div>
    </div>
  );
}

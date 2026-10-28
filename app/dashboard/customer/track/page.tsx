"use client";

import { AppInput } from "@/components/shared/app-input";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/table-helpers";
import { Button } from "@/components/ui/button";
import api, { type CustomAxiosRequestConfig } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime } from "@/lib/format";
import { useHandleErrors } from "@/lib/handle-errors";
import { SHIPMENT_STATUS } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import type { PublicTracking } from "@/types/customer";
import type { AxiosError } from "axios";
import { ArrowRight, Loader2, PackageSearch } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function TrackShipmentPageContent() {
  const handleErrors = useHandleErrors();
  const [reference, setReference] = useState("");
  const [tracking, setTracking] = useState<PublicTracking | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const searchParams = useSearchParams();
  const initialReference = searchParams.get("reference");

  const runSearch = async function (value: string) {
    const cleaned = value.trim().toUpperCase();
    if (!cleaned) return;

    setIsSearching(true);
    setNotFound(false);
    setTracking(null);
    try {
      const response = await api.get(API_ENDPOINTS.customer.shipments.trackByReference(encodeURIComponent(cleaned)), {} as CustomAxiosRequestConfig);
      setTracking(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 404) setNotFound(true);
      else handleErrors(axiosError);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = function (event: React.FormEvent) {
    event.preventDefault();
    runSearch(reference);
  };

  useEffect(() => {
    if (!initialReference) return;
    setReference(initialReference);
    runSearch(initialReference);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReference]);

  const status = tracking ? SHIPMENT_STATUS[tracking.status] : null;

  const routeLabel = (place: { city: string | null; state: string | null }) => [place.city, place.state].filter(Boolean).join(", ") || "-";

  return (
    <div>
      <PageHeader title="Track a shipment" description="Enter any HESED FastTrack tracking number, yours or one sent to you." />

      <section className="max-w-2xl rounded-2xl border border-line bg-white p-5 sm:p-5.5">
        <p className="text-[15px] font-bold tracking-tight text-foreground">Tracking number</p>
        <p className="mt-0.5 text-[12.5px] text-foreground-muted">Our HFT reference or the courier label number both work</p>
        <form onSubmit={handleSearch} className="mt-3.5 flex gap-2">
          <AppInput placeholder="HFT-XXXXXXXX-XXXXX" value={reference} onChange={event => setReference(event.target.value)} containerClassName="flex-1" className="rounded-xl" />
          <Button type="submit" className="h-11 rounded-xl px-5" disabled={isSearching || !reference.trim()}>
            {isSearching ? <Loader2 className="animate-spin" /> : "Track"}
          </Button>
        </form>
      </section>

      {notFound && (
        <div className="mt-5 max-w-2xl rounded-2xl border border-line bg-white">
          <EmptyState icon={PackageSearch} message="No shipment matches that tracking number. Check for typos. References look like HFT-ABC12345-DEF67." />
        </div>
      )}

      {tracking && status && (
        <div className="mt-5 grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section className="rounded-2xl border border-line bg-white p-5 sm:p-5.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-sm font-bold text-foreground">{tracking.reference}</p>
              <StatusBadge label={status.label} className={status.className} />
            </div>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="min-w-0">
                <p className="text-xs text-foreground-muted">From</p>
                <p className="truncate text-lg font-bold tracking-tight text-foreground">{tracking.origin.city ?? "-"}</p>
                <p className="truncate text-xs text-foreground-muted">{tracking.origin.state ?? ""}</p>
              </div>
              <span className="flex size-8 items-center justify-center rounded-full bg-brand text-white">
                <ArrowRight className="size-4" />
              </span>
              <div className="min-w-0 text-right">
                <p className="text-xs text-foreground-muted">To</p>
                <p className="truncate text-lg font-bold tracking-tight text-foreground">{tracking.destination.city ?? "-"}</p>
                <p className="truncate text-xs text-foreground-muted">{tracking.destination.state ?? ""}</p>
              </div>
            </div>
            <dl className="mt-4 divide-y divide-line border-t border-line text-[13px]">
              <div className="flex justify-between gap-3 py-2.5">
                <dt className="text-foreground-muted">Route</dt>
                <dd className="truncate text-right font-medium text-foreground">
                  {routeLabel(tracking.origin)} to {routeLabel(tracking.destination)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-2.5">
                <dt className="text-foreground-muted">Courier</dt>
                <dd className="truncate text-right font-medium text-foreground">
                  {tracking.courier_name} · {tracking.service_name}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-2.5">
                <dt className="text-foreground-muted">Booked</dt>
                <dd className="text-right font-medium text-foreground">{formatDateTime(tracking.createdAt)}</dd>
              </div>
              {tracking.delivered_at && (
                <div className="flex justify-between gap-3 py-2.5">
                  <dt className="text-foreground-muted">Delivered</dt>
                  <dd className="text-right font-medium text-foreground">{formatDateTime(tracking.delivered_at)}</dd>
                </div>
              )}
            </dl>
          </section>

          <SectionCard title="Timeline" description="Newest updates at the bottom">
            <ol className="px-5 py-4 sm:px-5.5">
              {tracking.events.map((event, index) => {
                const eventStatus = SHIPMENT_STATUS[event.to_status];
                const isLatest = index === tracking.events.length - 1;
                return (
                  <li key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={cn("mt-1 size-3 shrink-0 rounded-full", isLatest ? "bg-brand ring-4 ring-brand-muted" : "bg-line-strong")} />
                      {index < tracking.events.length - 1 && <span className="my-1 w-px flex-1 bg-line" />}
                    </div>
                    <div className="min-w-0 pb-4">
                      <p className="text-sm font-semibold text-foreground">{eventStatus?.label ?? event.to_status}</p>
                      {event.note && <p className="mt-0.5 text-[13px] text-foreground-muted">{event.note}</p>}
                      <p className="mt-0.5 text-xs text-foreground-subtle">{formatDateTime(event.createdAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

export default function TrackShipmentPage() {
  return (
    <Suspense>
      <TrackShipmentPageContent />
    </Suspense>
  );
}

"use client";

import { AppInput } from "@/components/shared/app-input";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import api, { type CustomAxiosRequestConfig } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime } from "@/lib/format";
import { useHandleErrors } from "@/lib/handle-errors";
import { SHIPMENT_STATUS } from "@/lib/statuses";
import type { PublicTracking } from "@/types/customer";
import type { AxiosError } from "axios";
import { Loader2, PackageSearch } from "lucide-react";
import { useState } from "react";

export default function TrackShipmentPage() {
  const handleErrors = useHandleErrors();
  const [reference, setReference] = useState("");
  const [tracking, setTracking] = useState<PublicTracking | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async function (event: React.FormEvent) {
    event.preventDefault();
    const cleaned = reference.trim().toUpperCase();
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

  const status = tracking ? SHIPMENT_STATUS[tracking.status] : null;

  return (
    <div>
      <PageHeader title="Track a shipment" description="Enter any HESED FastTrack tracking number — yours or one sent to you." />

      <form onSubmit={handleSearch} className="flex max-w-xl gap-2">
        <AppInput placeholder="HFT-XXXXXXXX-XXXXX" value={reference} onChange={event => setReference(event.target.value)} containerClassName="flex-1" />
        <Button type="submit" className="h-11" disabled={isSearching || !reference.trim()}>
          {isSearching ? <Loader2 className="animate-spin" /> : "Track"}
        </Button>
      </form>

      {notFound && (
        <div className="mt-8 max-w-xl rounded-2xl border border-line bg-white p-10 text-center">
          <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-foreground">No shipment matches that tracking number</p>
          <p className="mt-1 text-sm text-muted-foreground">Check for typos — references look like HFT-ABC12345-DEF67.</p>
        </div>
      )}

      {tracking && status && (
        <div className="mt-8 grid max-w-4xl gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm font-semibold text-foreground">{tracking.reference}</p>
              <StatusBadge label={status.label} className={status.className} />
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Route:</span> {[tracking.origin.city, tracking.origin.state].filter(Boolean).join(", ") || "—"} →{" "}
                {[tracking.destination.city, tracking.destination.state].filter(Boolean).join(", ") || "—"}
              </p>
              <p>
                <span className="font-medium text-foreground">Courier:</span> {tracking.courier_name} · {tracking.service_name}
              </p>
              <p>
                <span className="font-medium text-foreground">Booked:</span> {formatDateTime(tracking.createdAt)}
              </p>
              {tracking.delivered_at && (
                <p>
                  <span className="font-medium text-foreground">Delivered:</span> {formatDateTime(tracking.delivered_at)}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm font-semibold text-foreground">Timeline</p>
            <ol className="mt-4 space-y-4">
              {tracking.events.map((event, index) => {
                const eventStatus = SHIPMENT_STATUS[event.to_status];
                const isLatest = index === tracking.events.length - 1;
                return (
                  <li key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`mt-1 h-2.5 w-2.5 rounded-full ${isLatest ? "bg-brand" : "bg-line-strong"}`} />
                      {index < tracking.events.length - 1 && <div className="w-px flex-1 bg-line" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-semibold text-foreground">{eventStatus?.label ?? event.to_status}</p>
                      {event.note && <p className="mt-0.5 text-sm text-muted-foreground">{event.note}</p>}
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

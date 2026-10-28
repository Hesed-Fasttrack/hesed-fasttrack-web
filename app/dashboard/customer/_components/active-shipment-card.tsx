"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { SHIPMENT_STATUS, type ShipmentStatus } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import type { CustomerShipment, CustomerShipmentEvent, ShipmentAddressSnapshot } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { addDays, format, isToday } from "date-fns";
import { ArrowUpRight, ChevronLeft, ChevronRight, Copy, PackagePlus, Plane, Ship } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const REACHED_STEP: Record<ShipmentStatus, number> = {
  PENDING_PICKUP: 0,
  PENDING_DROP_OFF: 0,
  RECEIVED: 1,
  PICKED_UP: 1,
  IN_TRANSIT: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  CANCELLED: 0,
};

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

const countryName = function (code: string) {
  try {
    return countryNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
};

const formatStepTime = function (value: string | Date) {
  const date = new Date(value);
  return isToday(date) ? `Today, ${format(date, "HH:mm")}` : format(date, "d MMM, HH:mm");
};

const Lane = function ({ label, address, align = "left" }: { label: string; address: ShipmentAddressSnapshot; align?: "left" | "right" }) {
  return (
    <div className={cn("min-w-0", align === "right" && "sm:text-right")}>
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className="truncate text-xl font-bold tracking-tight text-foreground sm:text-[22px]">{address.city}</p>
      <p className="truncate text-xs text-foreground-muted">
        {address.state} · {countryName(address.country)}
      </p>
    </div>
  );
};

export const ActiveShipmentCard = function ({ shipments, isLoading }: { shipments: CustomerShipment[]; isLoading: boolean }) {
  const [index, setIndex] = useState(0);
  const shipment = shipments[Math.min(index, shipments.length - 1)];

  const { data: trackingData } = useGetData<APIResponse<{ shipment: CustomerShipment; events: CustomerShipmentEvent[] }>>({
    url: API_ENDPOINTS.customer.shipments.tracking(shipment?.id ?? ""),
    shouldFetch: !!shipment,
  });
  const events = trackingData?.data?.events ?? [];

  if (isLoading && !shipment) return <Skeleton className="h-90 rounded-2xl" />;

  if (!shipment) {
    return (
      <section className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-muted">
          <PackagePlus className="size-6 text-brand" />
        </div>
        <p className="mt-4 text-base font-bold text-foreground">Nothing on the move right now</p>
        <p className="mt-1 max-w-sm text-sm text-foreground-muted">Book a shipment and you can follow every step of its journey right here.</p>
        <Button asChild className="mt-5 h-10 rounded-xl px-5">
          <Link href="/dashboard/customer/book">Book a shipment</Link>
        </Button>
      </section>
    );
  }

  const status = SHIPMENT_STATUS[shipment.status];
  const reached = REACHED_STEP[shipment.status];
  const isDropOff = shipment.fulfilment_type === "DROP_OFF";
  const ModeIcon = /sea|ocean/i.test(shipment.service_name) ? Ship : Plane;
  const parcelCount = shipment.parcels?.length ?? 0;
  const isAwaitingHandover = reached === 0;
  const projectedEta = shipment.eta_max_days ? addDays(new Date(shipment.pickup_date ?? shipment.createdAt), shipment.eta_max_days) : null;
  const etaDate = !isAwaitingHandover && projectedEta && projectedEta > new Date() ? projectedEta : null;
  const etaLabel = etaDate
    ? `ETA ${format(etaDate, "EEE, d MMM")}`
    : isAwaitingHandover && shipment.eta_max_days
      ? `${shipment.eta_min_days && shipment.eta_min_days !== shipment.eta_max_days ? `${shipment.eta_min_days} to ` : ""}${shipment.eta_max_days} days after ${isDropOff ? "drop-off" : "pickup"}`
      : null;

  const eventTime = (target: ShipmentStatus[]) => events.find(event => target.includes(event.to_status))?.createdAt;
  const steps = [
    { label: "Booked", at: shipment.createdAt },
    { label: isDropOff ? "At the office" : "Picked up", at: eventTime(["RECEIVED", "PICKED_UP"]) },
    { label: "In transit", at: eventTime(["IN_TRANSIT"]) },
    { label: "Out for delivery", at: eventTime(["OUT_FOR_DELIVERY"]) },
    { label: "Delivered", at: eventTime(["DELIVERED"]) },
  ];

  const latest = events[events.length - 1];
  const progress = reached === 4 ? "100%" : `${reached * 20 + 10}%`;

  const handleCopy = function () {
    navigator.clipboard.writeText(shipment.reference);
    showToast("success", "Reference copied");
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-5.5 sm:pt-5.5">
        <div className="min-w-0">
          <p className="mb-1 text-xs text-foreground-muted">Active shipment</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-foreground">{shipment.reference}</span>
            <button type="button" onClick={handleCopy} aria-label="Copy reference" className="text-foreground-subtle transition-colors hover:text-foreground">
              <Copy className="size-3.5" />
            </button>
            <StatusBadge label={status.label} className={status.className} />
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 rounded-lg">
          <Link href={`/dashboard/customer/shipments/${shipment.id}`}>
            <span className="hidden sm:inline">View details</span>
            <ArrowUpRight />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-5 sm:px-5.5">
        <Lane label="From" address={shipment.origin} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-foreground-muted sm:max-w-44 sm:flex-col sm:flex-nowrap sm:gap-0 sm:text-center">
          <span className="sm:order-first">
            {shipment.service_name}
            {parcelCount > 0 && ` · ${parcelCount} ${parcelCount === 1 ? "parcel" : "parcels"}`}
          </span>
          <div className="relative my-4.5 hidden h-0.5 w-36 border-t-2 border-dashed border-line-strong sm:block">
            <span className="absolute top-1/2 left-[58%] flex size-7.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white ring-4 ring-white">
              <ModeIcon className="size-3.5" />
            </span>
          </div>
          {etaLabel && <span>{etaLabel}</span>}
        </div>
        <Lane label="To" address={shipment.destination} align="right" />
      </div>

      <div className="px-5 pb-5 sm:px-5.5 sm:pb-5.5">
        <div className="relative">
          <div className="absolute top-1.5 right-0 left-0 h-0.75 rounded-full bg-line" />
          <div className="absolute top-1.5 left-0 h-0.75 rounded-full bg-brand transition-all" style={{ width: progress }} />
          <ol className="relative grid grid-cols-5">
            {steps.map((step, stepIndex) => {
              const isDone = stepIndex < reached;
              const isNow = stepIndex === reached;

              return (
                <li key={step.label} className="relative min-w-0 pt-6 pr-1">
                  <span className={cn("absolute top-0 left-0 size-3.75 rounded-full border-[3px]", isDone ? "border-brand bg-brand" : isNow ? "border-brand bg-white ring-[5px] ring-brand-muted" : "border-line-strong bg-white")} />
                  <p className={cn("text-[11px] font-semibold sm:text-[12.5px]", isDone || isNow ? "text-foreground" : "text-foreground-subtle")}>{step.label}</p>
                  <p className="mt-px hidden text-[11.5px] text-foreground-muted sm:block">{step.at ? formatStepTime(step.at) : stepIndex === 3 && etaDate && !isDone ? `Expected ${format(etaDate, "d MMM")}` : "-"}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas px-5 py-3.5 sm:px-5.5">
        <div className="flex min-w-0 items-center gap-2.5 text-[13px]">
          <span className="size-2 shrink-0 rounded-full bg-brand ring-4 ring-brand-muted" />
          <span className="truncate">
            <span className="font-semibold text-foreground">{latest?.note || (latest ? SHIPMENT_STATUS[latest.to_status].label : "Booking confirmed")}</span>
            <span className="text-foreground-muted"> · {formatStepTime(latest?.createdAt ?? shipment.createdAt)}</span>
          </span>
        </div>
        {shipments.length > 1 && (
          <div className="flex items-center gap-1.5 text-[12.5px] text-foreground-muted">
            <button type="button" aria-label="Previous shipment" onClick={() => setIndex(current => (current - 1 + shipments.length) % shipments.length)} className="flex size-7 items-center justify-center rounded-lg border border-line bg-white hover:border-line-strong">
              <ChevronLeft className="size-3.5" />
            </button>
            {Math.min(index, shipments.length - 1) + 1} of {shipments.length} active
            <button type="button" aria-label="Next shipment" onClick={() => setIndex(current => (current + 1) % shipments.length)} className="flex size-7 items-center justify-center rounded-lg border border-line bg-white hover:border-line-strong">
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

"use client";

import { SectionCard } from "@/components/shared/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useState } from "react";

const niceMax = function (value: number) {
  if (value <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(value)));
  const scaled = Math.ceil(value / step / 2) * 2 * step;
  return scaled < value ? scaled * 2 : scaled;
};

export const DailyShipmentsChart = function ({ daily }: { daily: { date: string; count: number }[] | undefined }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = daily?.reduce((sum, day) => sum + day.count, 0) ?? 0;
  const peak = daily?.reduce((best, day) => (day.count > best.count ? day : best), daily[0]);
  const max = niceMax(peak?.count ?? 0);

  return (
    <SectionCard title="Shipments per day" description="Last 14 days, all routes" link={{ href: "/dashboard/admin/shipments", label: "Open shipments" }}>
      {!daily ? (
        <div className="p-5.5">
          <Skeleton className="h-55 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 px-5 pt-4.5 sm:px-5.5">
            <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">{total}</span>
            <span className="text-[12.5px] text-foreground-muted">{peak && peak.count > 0 ? `booked in the last 14 days · peak ${peak.count} on ${format(parseISO(peak.date), "EEE d MMM")}` : "booked in the last 14 days"}</span>
          </div>

          <div className="px-5 pt-2 pb-4.5 pl-11 sm:px-5.5 sm:pl-12">
            <div className="relative h-47.5 border-b border-line-strong" onMouseLeave={() => setHovered(null)}>
              {[0.5, 1].map(fraction => (
                <div key={fraction} className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-line" style={{ bottom: `${fraction * 100}%` }}>
                  <span className="absolute -top-2 right-full pr-2 text-[11px] text-foreground-subtle tabular-nums">{max * fraction}</span>
                </div>
              ))}

              <div className="absolute inset-0 grid grid-cols-14 items-end gap-0.5">
                {daily.map((day, index) => (
                  <button
                    type="button"
                    key={day.date}
                    aria-label={`${day.count} shipments on ${format(parseISO(day.date), "d MMM")}`}
                    onMouseEnter={() => setHovered(index)}
                    onFocus={() => setHovered(index)}
                    onBlur={() => setHovered(null)}
                    className="relative flex h-full items-end justify-center outline-none"
                  >
                    <span
                      className={cn("w-[62%] max-w-6.5 rounded-t-[4px] bg-brand transition-opacity", hovered !== null && hovered !== index && "opacity-45")}
                      style={{ height: day.count === 0 ? 0 : `max(${(day.count / max) * 100}%, 3px)` }}
                    />
                    {hovered === index && (
                      <span className="pointer-events-none absolute z-10 -translate-y-2 rounded-[9px] bg-foreground px-2.5 py-2 text-left text-xs whitespace-nowrap text-white" style={{ bottom: `${(day.count / max) * 100}%` }}>
                        <span className="block text-[13.5px] font-bold">
                          {day.count} {day.count === 1 ? "shipment" : "shipments"}
                        </span>
                        {format(parseISO(day.date), "EEE, d MMM")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-14 gap-0.5 text-center text-[11px] text-foreground-subtle tabular-nums">
              {daily.map((day, index) => (
                <span key={day.date}>{index % 2 === 0 ? format(parseISO(day.date), "d") : ""}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </SectionCard>
  );
};

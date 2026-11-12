import { formatDateTime } from "@/lib/format";
import {
  buildTimeline,
  type ShipmentCheckpoint,
  type TimelineStatusEvent,
} from "@/lib/tracking";
import { cn } from "@/lib/utils";

interface Props {
  events: TimelineStatusEvent[];
  checkpoints?: ShipmentCheckpoint[];
  emptyMessage: string;
}

export const TrackingTimeline = function ({
  events,
  checkpoints,
  emptyMessage,
}: Props) {
  const timeline = buildTimeline(events, checkpoints);

  if (timeline.length === 0)
    return (
      <p className="p-5 text-[13px] text-foreground-muted sm:p-5.5">
        {emptyMessage}
      </p>
    );

  return (
    <ol className="px-5 py-1.5 sm:px-5.5">
      {timeline.map((entry, index) => {
        const isLatest = index === timeline.length - 1;
        return (
          <li key={entry.key} className="relative flex gap-3 py-3">
            {!isLatest && (
              <span
                aria-hidden
                className="absolute top-7 -bottom-1 left-1.25 w-px bg-line"
              />
            )}
            <span
              className={cn(
                "mt-1 size-2.75 shrink-0 rounded-full",
                isLatest
                  ? "bg-brand ring-4 ring-brand-muted"
                  : "bg-line-strong",
              )}
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[13px] break-words",
                  entry.kind === "status"
                    ? "font-semibold text-foreground"
                    : "text-foreground",
                  entry.cancelled && "text-foreground-subtle line-through",
                )}
              >
                {entry.title}
              </p>
              {entry.detail && (
                <p className="mt-0.5 text-[13px] break-words text-foreground-muted">
                  {entry.detail}
                </p>
              )}
              <p className="mt-0.5 text-xs text-foreground-subtle">
                {formatDateTime(entry.at)}
                {entry.cancelled && " · Cancelled by the courier"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

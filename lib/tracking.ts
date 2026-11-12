import { SHIPMENT_STATUS } from "@/lib/statuses";
import type { ShipmentStatus } from "@/lib/statuses";

export interface TimelineStatusEvent {
  id: string;
  to_status: ShipmentStatus;
  note: string | null;
  createdAt: string;
}

export interface ShipmentCheckpoint {
  id: string;
  type: string;
  description: string;
  location: string | null;
  occurred_at: string;
  cancelled?: boolean;
}

export interface TimelineEntry {
  key: string;
  kind: "status" | "checkpoint";
  title: string;
  detail: string | null;
  at: string;
  cancelled: boolean;
}

// A status change and the checkpoint that caused it land in the same sync, so the status heads its checkpoint.
const STATUS_LEAD_MS = 60_000;

export const buildTimeline = function (
  events: TimelineStatusEvent[],
  checkpoints: ShipmentCheckpoint[] = [],
): TimelineEntry[] {
  const descriptions = new Set(checkpoints.map((item) => item.description));

  const statusEntries = events.map((event) => ({
    key: `status-${event.id}`,
    kind: "status" as const,
    title: SHIPMENT_STATUS[event.to_status]?.label ?? event.to_status,
    detail: event.note && !descriptions.has(event.note) ? event.note : null,
    at: event.createdAt,
    cancelled: false,
    sortAt: new Date(event.createdAt).getTime() - STATUS_LEAD_MS,
  }));

  const checkpointEntries = checkpoints.map((checkpoint) => ({
    key: `checkpoint-${checkpoint.id}`,
    kind: "checkpoint" as const,
    title: checkpoint.description,
    detail: checkpoint.location,
    at: checkpoint.occurred_at,
    cancelled: Boolean(checkpoint.cancelled),
    sortAt: new Date(checkpoint.occurred_at).getTime(),
  }));

  return [...statusEntries, ...checkpointEntries]
    .sort((a, b) => a.sortAt - b.sortAt)
    .map(({ sortAt, ...entry }) => entry);
};

export const latestTimelineLabel = function (
  events: TimelineStatusEvent[],
  checkpoints: ShipmentCheckpoint[] = [],
) {
  const timeline = buildTimeline(events, checkpoints).filter(
    (entry) => !entry.cancelled,
  );
  const latest = timeline[timeline.length - 1];

  if (!latest) return null;

  return {
    label:
      latest.kind === "status" ? (latest.detail ?? latest.title) : latest.title,
    at: latest.at,
  };
};

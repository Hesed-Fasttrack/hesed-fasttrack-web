export type ShipmentStatus = "PENDING_PICKUP" | "PENDING_DROP_OFF" | "RECEIVED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
export type ShipmentPaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";
export type WithdrawalStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED" | "FAILED";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

interface StatusPresentation {
  label: string;
  className: string;
}

// Status colour means the same thing app-wide: amber = waiting, royal/brand =
// moving, emerald = done, muted/danger = stopped. Mirrors the mobile app.
const tone = {
  amber: "bg-amber/10 text-amber",
  royal: "bg-royal/10 text-royal",
  brand: "bg-brand-muted text-brand",
  emerald: "bg-emerald/10 text-emerald",
  muted: "bg-muted text-muted-foreground",
  danger: "bg-danger/10 text-danger",
} as const;

export const SHIPMENT_STATUS: Record<ShipmentStatus, StatusPresentation> = {
  PENDING_PICKUP: { label: "Awaiting pickup", className: tone.amber },
  PENDING_DROP_OFF: { label: "Awaiting drop-off", className: tone.amber },
  RECEIVED: { label: "At the office", className: tone.royal },
  PICKED_UP: { label: "Picked up", className: tone.royal },
  IN_TRANSIT: { label: "In transit", className: tone.brand },
  OUT_FOR_DELIVERY: { label: "Out for delivery", className: tone.brand },
  DELIVERED: { label: "Delivered", className: tone.emerald },
  CANCELLED: { label: "Cancelled", className: tone.muted },
};

export const PAYMENT_STATUS: Record<ShipmentPaymentStatus, StatusPresentation> = {
  UNPAID: { label: "Unpaid", className: tone.amber },
  PAID: { label: "Paid", className: tone.emerald },
  REFUNDED: { label: "Refunded", className: tone.muted },
};

export const KYC_STATUS: Record<KycStatus, StatusPresentation> = {
  PENDING: { label: "Pending review", className: tone.amber },
  APPROVED: { label: "Approved", className: tone.emerald },
  REJECTED: { label: "Rejected", className: tone.danger },
};

export const WITHDRAWAL_STATUS: Record<WithdrawalStatus, StatusPresentation> = {
  PENDING: { label: "Pending", className: tone.amber },
  PROCESSING: { label: "Processing", className: tone.royal },
  COMPLETED: { label: "Completed", className: tone.emerald },
  REJECTED: { label: "Rejected", className: tone.danger },
  FAILED: { label: "Failed", className: tone.danger },
};

export const ACCOUNT_STATUS: Record<AccountStatus, StatusPresentation> = {
  ACTIVE: { label: "Active", className: tone.emerald },
  SUSPENDED: { label: "Suspended", className: tone.danger },
  DEACTIVATED: { label: "Deactivated", className: tone.muted },
};

// The transition machine enforces legality server-side; the UI offers the enum.
export const SHIPMENT_TRANSITIONS = ["RECEIVED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;

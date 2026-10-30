import type { AccountStatus, KycStatus, PaymentProofStatus, ShipmentPaymentStatus, ShipmentStatus } from "@/lib/statuses";

export interface PaginatedResponse<TItem> {
  message: string;
  data: TItem[];
  total: number;
  page: number;
  totalPages: number;
}

export type StatsRange = "today" | "7d" | "30d" | "year";

export interface AdminStats {
  range: StatsRange;
  revenue: { current_minor: number; previous_minor: number };
  shipments: { current: number; previous: number; total: number; by_status: Partial<Record<ShipmentStatus, number>> };
  customers: { total: number; new_in_range: number };
  payments: { pending: PaymentTotal; refund_due: PaymentTotal };
  daily: { date: string; count: number }[];
}

export interface AdminQueues {
  drop_offs: { count: number; oldest_at: string | null };
  kyc: { count: number; oldest_at: string | null };
  courier_failures: { count: number; latest: { id: string; reference: string } | null };
  payments: { count: number; oldest_at: string | null };
}

export interface AdminUserRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_no: string | null;
  role: string;
  account_status: AccountStatus;
  has_validated_email: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserRow {
  profile_pic: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  kyc: KycSubmission | null;
}

export interface ReviewUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export interface SnapshotAddress {
  contact_name: string;
  contact_phone?: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country: string;
  postal_code?: string | null;
}

export interface AdminShipment {
  id: string;
  reference: string;
  status: ShipmentStatus;
  payment_status: ShipmentPaymentStatus;
  fulfilment_type: "PICKUP" | "DROP_OFF";
  purpose: string;
  third_party_sender: boolean;
  sender_id_document_url: string | null;
  courier_name: string;
  service_name: string;
  amount_minor: number;
  origin: SnapshotAddress;
  destination: SnapshotAddress;
  parcels: { length_cm: number; width_cm: number; height_cm: number; items: { name: string; quantity: number; weight_kg: number }[] }[];
  pickup_date: string | null;
  eta_min_days: number | null;
  eta_max_days: number | null;
  courier_shipment_reference: string | null;
  courier_tracking_number: string | null;
  courier_tracking_url: string | null;
  courier_purchase_error: string | null;
  payments?: AdminShipmentPayment[];
  createdAt: string;
  user?: ReviewUser;
}

export interface ShipmentEvent {
  id: string;
  from_status: ShipmentStatus | null;
  to_status: ShipmentStatus;
  note: string | null;
  createdAt: string;
}

export interface KycSubmission {
  id: string;
  identity_type: "NIN" | "DRIVERS_LICENCE" | "INTL_PASSPORT";
  identity_number: string;
  identity_document_url: string;
  identity_status: KycStatus;
  identity_rejection_reason: string | null;
  address_proof_url: string;
  address_status: KycStatus;
  address_rejection_reason: string | null;
  status: KycStatus;
  submittedAt: string;
  user?: ReviewUser;
}

export type StaffUser = ReviewUser & { role: string };

export interface PaymentTotal {
  count: number;
  amount_minor: number;
}

export interface AdminShipmentPayment {
  id: string;
  shipmentId: string;
  amount_minor: number;
  proof_url: string;
  payer_name: string | null;
  note: string | null;
  status: PaymentProofStatus;
  rejection_reason: string | null;
  reviewedAt: string | null;
  reviewedBy: StaffUser | null;
  refundedAt: string | null;
  refundedBy: StaffUser | null;
  refund_note: string | null;
  createdAt: string;
}

export interface AdminPaymentRow extends AdminShipmentPayment {
  shipment: { id: string; reference: string; status: ShipmentStatus; payment_status: ShipmentPaymentStatus; fulfilment_type: "PICKUP" | "DROP_OFF" };
  user: ReviewUser;
}

export interface PaymentsSummary {
  approved: PaymentTotal;
  pending: PaymentTotal;
  rejected: { count: number };
  refunded: PaymentTotal;
  refund_due: PaymentTotal;
}

export interface AdminRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  account_status: AccountStatus;
  lastLogin: string | null;
  createdAt: string;
}

export interface AdminActivity {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  summary: string;
  createdAt: string;
  actor: ReviewUser & { role: string };
}

export const displayName = function (user?: { first_name?: string | null; last_name?: string | null; email?: string } | null) {
  if (!user) return "-";
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "-";
};

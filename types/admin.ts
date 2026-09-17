import type { AccountStatus, KycStatus, ShipmentPaymentStatus, ShipmentStatus, WithdrawalStatus } from "@/lib/statuses";

export interface PaginatedResponse<TItem> {
  message: string;
  data: TItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminStats {
  customers: { total: number; new_this_month: number };
  shipments: { total: number; by_status: Partial<Record<ShipmentStatus, number>> };
  revenue: { lifetime_minor: number; this_month_minor: number };
  wallets: { total_balance_minor: number };
  kyc: { pending_review: number };
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
  wallet: { id: string; available_minor: number } | null;
  kyc: KycSubmission | null;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount_minor: number;
  reference: string;
  narration: string | null;
  createdAt: string;
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

export interface Withdrawal {
  id: string;
  amount_minor: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: WithdrawalStatus;
  reference: string;
  rejection_reason: string | null;
  createdAt: string;
  user?: ReviewUser;
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
  if (!user) return "—";
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "—";
};

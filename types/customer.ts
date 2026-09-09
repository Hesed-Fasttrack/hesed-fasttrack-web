import type { KycStatus, ShipmentPaymentStatus, ShipmentStatus, WithdrawalStatus } from "@/lib/statuses";

export interface Address {
  id: string;
  label: string | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string | null;
  is_default: boolean;
  createdAt: string;
}

export interface Wallet {
  id: string;
  available_minor: number;
  lifetime_funded_minor: number;
  currency: string;
  dva_account_number: string | null;
  dva_account_name: string | null;
  dva_bank_name: string | null;
}

export interface CustomerTransaction {
  id: string;
  type: string;
  amount_minor: number;
  reference: string;
  narration: string | null;
  createdAt: string;
}

export interface Bank {
  name: string;
  code: string;
}

export interface CustomerWithdrawal {
  id: string;
  amount_minor: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: WithdrawalStatus;
  rejection_reason: string | null;
  createdAt: string;
}

export interface CourierQuote {
  courier_code: string;
  courier_name: string;
  service_code: string;
  service_name: string;
  amount_minor: number;
  currency: string;
  eta_days: { min: number; max: number };
}

export type ShipmentPurpose = "PERSONAL" | "COMMERCIAL" | "GIFT" | "DOCUMENTS";
export type FulfilmentType = "PICKUP" | "DROP_OFF";

// One declared line inside a box. weight_kg is the line's total, not per unit.
export interface ShipmentItem {
  name: string;
  category: string;
  value_minor: number;
  quantity: number;
  weight_kg: number;
  description?: string;
}

export interface ShipmentParcel {
  length_cm: number;
  width_cm: number;
  height_cm: number;
  items: ShipmentItem[];
}

export interface ShipmentAddressSnapshot {
  contact_name: string;
  contact_phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string | null;
}

export interface CustomerShipment {
  id: string;
  reference: string;
  courier_code: string;
  courier_name: string;
  service_code: string;
  service_name: string;
  status: ShipmentStatus;
  payment_status: ShipmentPaymentStatus;
  amount_minor: number;
  currency: string;
  origin: ShipmentAddressSnapshot;
  destination: ShipmentAddressSnapshot;
  parcels: ShipmentParcel[];
  purpose: ShipmentPurpose;
  fulfilment_type: FulfilmentType;
  pickup_date: string | null;
  eta_min_days: number | null;
  eta_max_days: number | null;
  courier_tracking_number?: string | null;
  createdAt: string;
}

export interface CustomerShipmentEvent {
  id: string;
  from_status: ShipmentStatus | null;
  to_status: ShipmentStatus;
  note: string | null;
  createdAt: string;
}

export type KycIdentityType = "NIN" | "DRIVERS_LICENCE" | "INTL_PASSPORT";

export interface CustomerKycSubmission {
  id: string;
  identity_type: KycIdentityType;
  identity_number: string;
  identity_status: KycStatus;
  identity_rejection_reason: string | null;
  address_status: KycStatus;
  address_rejection_reason: string | null;
  status: KycStatus;
  submittedAt: string;
}

export interface CountryOption {
  name: string;
  code: string;
  flag: string;
}

export interface StateOption {
  name: string;
  code: string;
}

export interface CityOption {
  name: string;
}

export const SHIPMENT_PURPOSES: { value: ShipmentPurpose; label: string }[] = [
  { value: "PERSONAL", label: "Personal effects" },
  { value: "COMMERCIAL", label: "Commercial goods" },
  { value: "GIFT", label: "Gift" },
  { value: "DOCUMENTS", label: "Documents" },
];

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SHIPMENT_STATUS" | "PAYMENT" | "WALLET" | "KYC" | "PROMO" | "MESSAGE";

export interface CustomerNotification {
  id: string;
  type: NotificationType;
  title: string | null;
  message: string;
  status: "UNREAD" | "READ";
  createdAt: string;
}

// The sanitized track-by-reference payload — no money, no contacts.
export interface PublicTracking {
  reference: string;
  status: ShipmentStatus;
  courier_name: string;
  service_name: string;
  origin: { city: string | null; state: string | null };
  destination: { city: string | null; state: string | null };
  createdAt: string;
  delivered_at: string | null;
  events: { id: string; to_status: ShipmentStatus; note: string | null; createdAt: string }[];
}

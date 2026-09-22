import type { Address, CourierQuote, FulfilmentType, PackageType, ShipmentParcel, ShipmentPurpose } from "@/types/customer";
import { create } from "zustand";

// The booking wizard's working state, shared across its steps.
interface BookingState {
  step: "details" | "rates" | "confirm";
  senderAddress: Address | null;
  receiverAddress: Address | null;
  fulfilmentType: FulfilmentType | null;
  purpose: ShipmentPurpose | null;
  packageType: PackageType | null;
  parcels: ShipmentParcel[];
  quote: CourierQuote | null;
  setStep: (step: BookingState["step"]) => void;
  setSenderAddress: (address: Address) => void;
  setReceiverAddress: (address: Address) => void;
  setFulfilmentType: (fulfilmentType: FulfilmentType) => void;
  setPurpose: (purpose: ShipmentPurpose) => void;
  setPackageType: (packageType: PackageType) => void;
  upsertParcel: (index: number | null, parcel: ShipmentParcel) => void;
  removeParcel: (index: number) => void;
  setQuote: (quote: CourierQuote) => void;
  reset: () => void;
}

const initialState = {
  step: "details" as const,
  senderAddress: null,
  receiverAddress: null,
  fulfilmentType: null,
  purpose: null,
  packageType: null,
  parcels: [],
  quote: null,
};

export const useBookingStore = create<BookingState>(set => ({
  ...initialState,

  setStep: step => set({ step }),
  setSenderAddress: address => set({ senderAddress: address }),
  setReceiverAddress: address => set({ receiverAddress: address }),
  setFulfilmentType: fulfilmentType => set({ fulfilmentType }),
  setPurpose: purpose => set({ purpose }),
  setPackageType: packageType => set({ packageType }),

  upsertParcel: (index, parcel) =>
    set(state => ({
      parcels: index === null ? [...state.parcels, parcel] : state.parcels.map((entry, i) => (i === index ? parcel : entry)),
    })),

  removeParcel: index =>
    set(state => ({
      parcels: state.parcels.filter((_, i) => i !== index),
    })),

  setQuote: quote => set({ quote }),

  reset: () => set(initialState),
}));

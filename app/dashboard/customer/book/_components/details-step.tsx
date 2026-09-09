"use client";

import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { ParcelDialog } from "@/components/shared/parcel-dialog";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { showToast } from "@/lib/show-toast";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/booking";
import type { Address, FulfilmentType, ShipmentPurpose } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { Building2, Pencil, Plus, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PURPOSES: { value: ShipmentPurpose; label: string }[] = [
  { value: "PERSONAL", label: "Personal belongings" },
  { value: "COMMERCIAL", label: "Commercial goods" },
  { value: "GIFT", label: "Gift" },
  { value: "DOCUMENTS", label: "Documents" },
];

const FULFILMENT_OPTIONS: { value: FulfilmentType; label: string; description: string; icon: typeof Truck }[] = [
  { value: "DROP_OFF", label: "Drop off at our office", description: "Bring your parcel in — we verify it, then you pay in-app.", icon: Building2 },
  { value: "PICKUP", label: "Courier pickup", description: "The courier collects from the sender's address. Paid at booking.", icon: Truck },
];

const formatAddress = (address: Address) => `${address.contact_name} — ${address.line1}, ${address.city}, ${address.state}`;

export const DetailsStep = function () {
  const { senderAddress, receiverAddress, fulfilmentType, purpose, parcels, setSenderAddress, setReceiverAddress, setFulfilmentType, setPurpose, upsertParcel, removeParcel, setStep } = useBookingStore();
  const [editingParcel, setEditingParcel] = useState<number | null | "new">(null);

  const { data: addressesData } = useGetData<APIResponse<Address[]>>({ url: API_ENDPOINTS.customer.addresses.list });
  const addresses = addressesData?.data ?? [];

  const handleContinue = function () {
    if (!senderAddress || !receiverAddress) return showToast("warning", "Choose both a sender and a receiver address");
    if (senderAddress.id === receiverAddress.id) return showToast("warning", "Sender and receiver can't be the same address");
    if (!fulfilmentType) return showToast("warning", "Choose pickup or drop-off");
    if (!purpose) return showToast("warning", "What is this shipment for?");
    if (parcels.length === 0) return showToast("warning", "Add at least one parcel");
    setStep("rates");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold text-foreground">Route</p>
        {addresses.length === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            No saved addresses yet —{" "}
            <Link href="/dashboard/customer/addresses" className="font-medium text-brand hover:underline">
              add one first
            </Link>
            .
          </p>
        )}
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <AppSimpleSelect
            label="Sender"
            placeholder="Who is sending?"
            value={senderAddress?.id ?? ""}
            onValueChange={value => setSenderAddress(addresses.find(address => address.id === value)!)}
            options={addresses.map(address => ({ label: formatAddress(address), value: address.id }))}
          />
          <AppSimpleSelect
            label="Receiver"
            placeholder="Who is receiving?"
            value={receiverAddress?.id ?? ""}
            onValueChange={value => setReceiverAddress(addresses.find(address => address.id === value)!)}
            options={addresses.map(address => ({ label: formatAddress(address), value: address.id }))}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold text-foreground">Pickup or drop-off</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {FULFILMENT_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFulfilmentType(option.value)}
              className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition-colors", fulfilmentType === option.value ? "border-brand bg-brand-muted/40" : "border-line hover:bg-muted")}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted">
                <option.icon className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{option.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold text-foreground">Purpose of shipment</p>
        <AppSimpleSelect containerClassName="mt-3 sm:w-72" placeholder="What are you shipping this as?" value={purpose ?? ""} onValueChange={value => setPurpose(value as ShipmentPurpose)} options={PURPOSES} />
      </div>

      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Parcels</p>
          <Button variant="outline" size="sm" onClick={() => setEditingParcel("new")}>
            <Plus />
            Add parcel
          </Button>
        </div>

        {parcels.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Add your first parcel — its box size and what's inside.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
            {parcels.map((parcel, index) => (
              <li key={index} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {parcel.length_cm}×{parcel.width_cm}×{parcel.height_cm}cm
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {parcel.items.map(item => `${item.quantity}× ${item.name}`).join(", ")} · {formatNaira(parcel.items.reduce((sum, item) => sum + item.value_minor, 0))}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon-sm" variant="ghost" aria-label="Edit parcel" onClick={() => setEditingParcel(index)}>
                    <Pencil />
                  </Button>
                  <Button size="icon-sm" variant="ghost" aria-label="Remove parcel" onClick={() => removeParcel(index)}>
                    <Trash2 className="text-danger" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button size="lg" className="h-11 w-full sm:w-auto sm:px-8" onClick={handleContinue}>
        Compare rates
      </Button>

      <ParcelDialog
        open={editingParcel !== null}
        parcel={typeof editingParcel === "number" ? parcels[editingParcel] : null}
        onSave={parcel => upsertParcel(typeof editingParcel === "number" ? editingParcel : null, parcel)}
        onClose={() => setEditingParcel(null)}
      />
    </div>
  );
};

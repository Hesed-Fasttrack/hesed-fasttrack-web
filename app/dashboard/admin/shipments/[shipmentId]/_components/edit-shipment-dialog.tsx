"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { ParcelDialog } from "@/components/shared/parcel-dialog";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { showToast } from "@/lib/show-toast";
import type { AdminShipment, SnapshotAddress } from "@/types/admin";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SnapshotAddressDialog } from "./snapshot-address-dialog";

interface Props {
  shipment: AdminShipment;
  open: boolean;
  onClose: () => void;
}

type EditableParcel = AdminShipment["parcels"][number] & { items: { name: string; category: string; value_minor: number; quantity: number; weight_kg: number; description?: string }[] };

export const EditShipmentDialog = function ({ shipment, open, onClose }: Props) {
  const [parcels, setParcels] = useState<EditableParcel[]>([]);
  const [origin, setOrigin] = useState<SnapshotAddress | null>(null);
  const [destination, setDestination] = useState<SnapshotAddress | null>(null);
  const [editingParcel, setEditingParcel] = useState<number | null | "new">(null);
  const [editingAddress, setEditingAddress] = useState<"origin" | "destination" | null>(null);

  useEffect(() => {
    if (!open) return;
    setParcels(shipment.parcels as EditableParcel[]);
    setOrigin(shipment.origin);
    setDestination(shipment.destination);
  }, [open, shipment]);

  const { mutate: saveShipment, isPending } = useSubmitData<{ parcels: EditableParcel[]; origin: SnapshotAddress; destination: SnapshotAddress }, unknown>({
    url: API_ENDPOINTS.admin.shipments.edit(shipment.id),
    method: "patch",
    onSuccessMessage: "Shipment updated — the price was re-derived and the customer notified",
    additionalQueryKeys: [[API_ENDPOINTS.admin.shipments.detail(shipment.id)]],
    onSuccess: onClose,
  });

  const handleSave = function () {
    if (parcels.length === 0) return showToast("warning", "A shipment needs at least one parcel");
    if (!origin || !destination) return;
    saveShipment({ parcels, origin, destination });
  };

  return (
    <>
      <AppDialog
        isOpen={open}
        onOpenChange={isOpen => !isOpen && onClose()}
        title="Edit shipment details"
        description="Correct the addresses and parcels to match what arrived at the office. Saving re-derives the price the customer pays."
        isSubmitting={isPending}
        dialogFooter={
          <>
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Save & re-price
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Route</p>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {(
              [
                { key: "origin", label: "From", address: origin },
                { key: "destination", label: "To", address: destination },
              ] as const
            ).map(entry => (
              <li key={entry.key} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {entry.label} — {entry.address?.contact_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{entry.address && `${entry.address.line1}, ${entry.address.city}, ${entry.address.state}, ${entry.address.country}`}</p>
                </div>
                <Button size="icon-sm" variant="ghost" aria-label={`Edit ${entry.label.toLowerCase()} address`} onClick={() => setEditingAddress(entry.key)}>
                  <Pencil />
                </Button>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Declared total: <span className="font-semibold text-foreground">{formatNaira(shipment.amount_minor)}</span>
            </p>
            <Button variant="outline" size="sm" onClick={() => setEditingParcel("new")}>
              <Plus />
              Add parcel
            </Button>
          </div>

          {parcels.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">No parcels — add what actually arrived.</p>
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {parcels.map((parcel, index) => (
                <li key={index} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {parcel.length_cm}×{parcel.width_cm}×{parcel.height_cm}cm
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{parcel.items.map(item => `${item.quantity}× ${item.name} (${item.weight_kg}kg)`).join(", ")}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost" aria-label="Edit parcel" onClick={() => setEditingParcel(index)}>
                      <Pencil />
                    </Button>
                    <Button size="icon-sm" variant="ghost" aria-label="Remove parcel" onClick={() => setParcels(current => current.filter((_, i) => i !== index))}>
                      <Trash2 className="text-danger" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AppDialog>

      <ParcelDialog
        open={editingParcel !== null}
        parcel={typeof editingParcel === "number" ? parcels[editingParcel] : null}
        onSave={parcel => setParcels(current => (typeof editingParcel === "number" ? current.map((entry, i) => (i === editingParcel ? (parcel as EditableParcel) : entry)) : [...current, parcel as EditableParcel]))}
        onClose={() => setEditingParcel(null)}
      />

      <SnapshotAddressDialog
        open={editingAddress !== null}
        title={editingAddress === "destination" ? "Edit receiver address" : "Edit sender address"}
        address={editingAddress === "origin" ? origin : editingAddress === "destination" ? destination : null}
        onSave={address => (editingAddress === "origin" ? setOrigin(address) : setDestination(address))}
        onClose={() => setEditingAddress(null)}
      />
    </>
  );
};

"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppInput } from "@/components/shared/app-input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { showToast } from "@/lib/show-toast";
import type { ShipmentItem, ShipmentParcel } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const EMPTY_ITEM = { name: "", category: "", value: "", quantity: "1", weight: "" };

interface Props {
  open: boolean;
  parcel: ShipmentParcel | null;
  onSave: (parcel: ShipmentParcel) => void;
  onClose: () => void;
}

export const ParcelDialog = function ({ open, parcel, onSave, onClose }: Props) {
  const [dims, setDims] = useState({ length: "", width: "", height: "" });
  const [items, setItems] = useState<ShipmentItem[]>([]);
  const [draft, setDraft] = useState(EMPTY_ITEM);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const debouncedCategory = useDebounce(draft.category, 300);

  const { data: categoriesData } = useGetData<APIResponse<string[]>>({
    url: API_ENDPOINTS.customer.lookups.categories(debouncedCategory),
    shouldFetch: open && debouncedCategory.trim().length >= 2,
  });
  const suggestions = (categoriesData?.data ?? []).filter(category => category.toLowerCase() !== draft.category.trim().toLowerCase()).slice(0, 5);

  useEffect(() => {
    if (!open) return;
    if (parcel) {
      setDims({ length: String(parcel.length_cm), width: String(parcel.width_cm), height: String(parcel.height_cm) });
      setItems(parcel.items);
    } else {
      setDims({ length: "", width: "", height: "" });
      setItems([]);
    }
    setDraft(EMPTY_ITEM);
    setEditingItem(null);
  }, [open, parcel]);

  const handleEditItem = function (index: number) {
    const item = items[index];
    setDraft({ name: item.name, category: item.category, value: String(item.value_minor / 100), quantity: String(item.quantity), weight: String(item.weight_kg) });
    setEditingItem(index);
  };

  const handleRemoveItem = function (index: number) {
    setItems(current => current.filter((_, i) => i !== index));
    if (editingItem === index) {
      setDraft(EMPTY_ITEM);
      setEditingItem(null);
    }
  };

  const handleAddItem = function () {
    const value = Number(draft.value);
    const quantity = Number(draft.quantity);
    const weight = Number(draft.weight);

    if (draft.name.trim().length < 2) return showToast("warning", "What is this item?");
    if (draft.category.trim().length < 2) return showToast("warning", "Give the item a category");
    if (!value || value <= 0) return showToast("warning", "Enter the item's value");
    if (!quantity || quantity < 1) return showToast("warning", "Quantity must be at least 1");
    if (!weight || weight <= 0) return showToast("warning", "Enter the line's total weight");

    const entry = { name: draft.name.trim(), category: draft.category.trim(), value_minor: Math.round(value * 100), quantity, weight_kg: weight };

    if (editingItem !== null) setItems(current => current.map((item, i) => (i === editingItem ? entry : item)));
    else setItems(current => [...current, entry]);

    setDraft(EMPTY_ITEM);
    setEditingItem(null);
  };

  const handleSave = function () {
    const length_cm = Number(dims.length);
    const width_cm = Number(dims.width);
    const height_cm = Number(dims.height);

    if (!length_cm || !width_cm || !height_cm) return showToast("warning", "Enter the box dimensions — couriers charge on size too");
    if (items.length === 0) return showToast("warning", "Add at least one item to this parcel");

    onSave({ length_cm, width_cm, height_cm, items });
    onClose();
  };

  return (
    <AppDialog
      isOpen={open}
      onOpenChange={isOpen => !isOpen && onClose()}
      title={parcel ? "Edit parcel" : "Add a parcel"}
      description="The box size and what's inside — couriers charge on the larger of actual and volumetric weight."
      dialogFooter={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save parcel</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <AppInput label="Length (cm)" type="number" min={1} value={dims.length} onChange={event => setDims({ ...dims, length: event.target.value })} />
          <AppInput label="Width (cm)" type="number" min={1} value={dims.width} onChange={event => setDims({ ...dims, width: event.target.value })} />
          <AppInput label="Height (cm)" type="number" min={1} value={dims.height} onChange={event => setDims({ ...dims, height: event.target.value })} />
        </div>

        {items.length > 0 && (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {items.map((item, index) => (
              <li key={`${item.name}-${index}`} className={`flex items-center justify-between gap-3 px-4 py-3 ${editingItem === index ? "bg-brand-muted/30" : ""}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.quantity}× {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} · {item.weight_kg}kg · {formatNaira(item.value_minor)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon-sm" variant="ghost" aria-label="Edit item" onClick={() => handleEditItem(index)}>
                    <Pencil />
                  </Button>
                  <Button size="icon-sm" variant="ghost" aria-label="Remove item" onClick={() => handleRemoveItem(index)}>
                    <Trash2 className="text-danger" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
          <p className="text-sm font-semibold text-foreground">{editingItem !== null ? "Edit item" : "Add an item"}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <AppInput label="Item" placeholder="Leather shoes" value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} />
            <div className="relative">
              <AppInput label="Category" placeholder="Footwear" value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })} />
              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-white py-1 shadow-sm">
                  {suggestions.map(category => (
                    <button key={category} type="button" className="block w-full px-3 py-1.5 text-left text-sm hover:bg-muted" onClick={() => setDraft({ ...draft, category })}>
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <AppInput label="Value (₦)" type="number" min={1} value={draft.value} onChange={event => setDraft({ ...draft, value: event.target.value })} />
            <AppInput label="Quantity" type="number" min={1} value={draft.quantity} onChange={event => setDraft({ ...draft, quantity: event.target.value })} />
            <AppInput label="Total kg" type="number" min={0.1} step="0.1" value={draft.weight} onChange={event => setDraft({ ...draft, weight: event.target.value })} />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            {editingItem !== null ? "Update item" : "Add item"}
          </Button>
          {editingItem !== null && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft(EMPTY_ITEM);
                setEditingItem(null);
              }}
            >
              Cancel edit
            </Button>
          )}
        </div>
      </div>
    </AppDialog>
  );
};

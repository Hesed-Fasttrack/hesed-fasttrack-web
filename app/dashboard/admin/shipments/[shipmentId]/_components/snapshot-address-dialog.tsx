"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppInput } from "@/components/shared/app-input";
import { AppSelect } from "@/components/shared/app-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import type { SnapshotAddress } from "@/types/admin";
import type { CityOption, CountryOption, StateOption } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { useEffect, useState } from "react";

const EMPTY_FIELDS = { contact_name: "", contact_phone: "", line1: "", line2: "", city: "", state: "", postal_code: "" };

interface Props {
  open: boolean;
  title: string;
  address: SnapshotAddress | null;
  onSave: (address: SnapshotAddress) => void;
  onClose: () => void;
}

export const SnapshotAddressDialog = function ({ open, title, address, onSave, onClose }: Props) {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [country, setCountry] = useState("NG");
  const [stateCode, setStateCode] = useState("");

  const { data: countriesData } = useGetData<APIResponse<CountryOption[]>>({ url: API_ENDPOINTS.customer.lookups.countries, shouldFetch: open });
  const countries = countriesData?.data ?? [];

  const { data: statesData } = useGetData<APIResponse<StateOption[]>>({ url: API_ENDPOINTS.customer.lookups.states(country), shouldFetch: open && !!country });
  const states = statesData?.data ?? [];

  const { data: citiesData } = useGetData<APIResponse<CityOption[]>>({ url: API_ENDPOINTS.customer.lookups.cities(country, stateCode), shouldFetch: open && !!country && !!stateCode });
  const cities = citiesData?.data ?? [];

  useEffect(() => {
    if (!open || !address) return;
    setFields({
      contact_name: address.contact_name,
      contact_phone: address.contact_phone ?? "",
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code ?? "",
    });
    setCountry(address.country);
    setStateCode("");
  }, [open, address]);

  // Snapshots store the state name; the cities lookup wants its ISO code.
  useEffect(() => {
    if (!address || states.length === 0) return;
    const match = states.find(state => state.name === address.state);
    if (match) setStateCode(match.code);
  }, [address, states]);

  const setField = function (name: keyof typeof EMPTY_FIELDS, value: string) {
    setFields(current => ({ ...current, [name]: value }));
  };

  const handleSave = function () {
    if (fields.contact_name.trim().length < 2) return showToast("warning", "Who should the courier ask for?");
    if (fields.contact_phone.trim().length < 7) return showToast("warning", "A phone number is required");
    if (fields.line1.trim().length < 3) return showToast("warning", "Street address is required");
    if (!fields.state.trim()) return showToast("warning", "State is required");
    if (!fields.city.trim()) return showToast("warning", "City is required");

    onSave({
      contact_name: fields.contact_name.trim(),
      contact_phone: fields.contact_phone.trim(),
      line1: fields.line1.trim(),
      line2: fields.line2.trim() || null,
      city: fields.city.trim(),
      state: fields.state.trim(),
      country,
      postal_code: fields.postal_code.trim() || null,
    });
    onClose();
  };

  return (
    <AppDialog
      isOpen={open}
      onOpenChange={isOpen => !isOpen && onClose()}
      title={title}
      description="Correct the address to match the shipping label. Saving the shipment re-derives the price on the new route."
      dialogFooter={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save address</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AppInput label="Contact name" value={fields.contact_name} onChange={event => setField("contact_name", event.target.value)} />
          <AppInput label="Phone" value={fields.contact_phone} onChange={event => setField("contact_phone", event.target.value)} />
        </div>

        <AppInput label="Street address" value={fields.line1} onChange={event => setField("line1", event.target.value)} />
        <AppInput label="Apartment, suite… (optional)" value={fields.line2} onChange={event => setField("line2", event.target.value)} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Country</Label>
            <AppSelect
              placeholder="Country"
              value={country}
              onValueChange={value => {
                setCountry(value ?? "NG");
                setStateCode("");
                setField("state", "");
                setField("city", "");
              }}
              options={countries.map(option => ({ label: `${option.flag} ${option.name}`, value: option.code }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>State</Label>
            {states.length > 0 ? (
              <AppSelect
                placeholder="State"
                value={stateCode || null}
                onValueChange={value => {
                  setStateCode(value ?? "");
                  const selected = states.find(state => state.code === value);
                  setField("state", selected?.name ?? value ?? "");
                  setField("city", "");
                }}
                options={states.map(option => ({ label: option.name, value: option.code }))}
              />
            ) : (
              <AppInput placeholder="State or region" value={fields.state} onChange={event => setField("state", event.target.value)} />
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>City</Label>
            {cities.length > 0 ? (
              <AppSelect placeholder="City" value={fields.city || null} onValueChange={value => setField("city", value ?? "")} options={cities.map(option => ({ label: option.name, value: option.name }))} />
            ) : (
              <AppInput placeholder="City" value={fields.city} onChange={event => setField("city", event.target.value)} />
            )}
          </div>

          <AppInput label="Postal code" placeholder="Needed for express rates" value={fields.postal_code} onChange={event => setField("postal_code", event.target.value)} />
        </div>
      </div>
    </AppDialog>
  );
};

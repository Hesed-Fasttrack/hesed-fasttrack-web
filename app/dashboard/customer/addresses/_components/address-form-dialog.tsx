"use client";

import { FormInput } from "@/components/form/form-input";
import { AppDialog } from "@/components/shared/app-dialog";
import { AppSelect } from "@/components/shared/app-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { Address, CityOption, CountryOption, StateOption } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const addressSchema = z.object({
  label: z.string().trim().optional(),
  contact_name: z.string().trim().min(2, "Who should the courier ask for?"),
  contact_phone: z.string().trim().min(7, "A phone number is required"),
  contact_email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  line1: z.string().trim().min(3, "Street address is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postal_code: z.string().trim().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface Props {
  open: boolean;
  address: Address | null;
  onClose: () => void;
  onCreated?: (address: Address) => void;
}

export const AddressFormDialog = function ({ open, address, onClose, onCreated }: Props) {
  const [country, setCountry] = useState("NG");
  const [stateCode, setStateCode] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema) });

  const cityName = watch("city");

  const { data: countriesData } = useGetData<APIResponse<CountryOption[]>>({ url: API_ENDPOINTS.customer.lookups.countries, shouldFetch: open });
  const countries = countriesData?.data ?? [];

  const { data: statesData } = useGetData<APIResponse<StateOption[]>>({ url: API_ENDPOINTS.customer.lookups.states(country), shouldFetch: open && !!country });
  const states = statesData?.data ?? [];

  const { data: citiesData } = useGetData<APIResponse<CityOption[]>>({
    url: API_ENDPOINTS.customer.lookups.cities(country, stateCode),
    shouldFetch: open && !!country && !!stateCode,
  });
  const cities = citiesData?.data ?? [];

  // editing: hydrate the form and recover the state ISO code by name
  useEffect(() => {
    if (!open) return;
    if (address) {
      reset({
        label: address.label ?? "",
        contact_name: address.contact_name,
        contact_phone: address.contact_phone,
        contact_email: address.contact_email ?? "",
        line1: address.line1,
        line2: address.line2 ?? "",
        city: address.city,
        state: address.state,
        postal_code: address.postal_code ?? "",
      });
      setCountry(address.country);
    } else {
      reset({ label: "", contact_name: "", contact_phone: "", contact_email: "", line1: "", line2: "", city: "", state: "", postal_code: "" });
      setCountry("NG");
      setStateCode("");
    }
  }, [open, address, reset]);

  useEffect(() => {
    if (!address || states.length === 0) return;
    const match = states.find(state => state.name === address.state);
    if (match) setStateCode(match.code);
  }, [address, states]);

  const isEditing = !!address;

  const { mutate: saveAddress, isPending } = useSubmitData<AddressFormValues & { country: string }, APIResponse<Address>>({
    url: isEditing ? API_ENDPOINTS.customer.addresses.update(address.id) : API_ENDPOINTS.customer.addresses.create,
    method: isEditing ? "put" : "post",
    onSuccessMessage: isEditing ? "Address updated" : "Address saved",
    additionalQueryKeys: [[API_ENDPOINTS.customer.addresses.list]],
    onSuccess: response => {
      if (!isEditing && response?.data) onCreated?.(response.data);
      onClose();
    },
  });

  const onSubmit = function (data: AddressFormValues) {
    saveAddress({
      ...data,
      label: data.label || undefined,
      contact_email: data.contact_email || undefined,
      line2: data.line2 || undefined,
      postal_code: data.postal_code || undefined,
      country,
    });
  };

  return (
    <AppDialog
      isOpen={open}
      onOpenChange={isOpen => !isOpen && onClose()}
      title={isEditing ? "Edit address" : "New address"}
      isSubmitting={isPending}
      dialogFooter={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="address-form" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isEditing ? "Save changes" : "Save address"}
          </Button>
        </>
      }
    >
      <form id="address-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput<AddressFormValues> control={control} name="label" errors={errors} label="Label (optional)" placeholder="Home, Office…" />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput<AddressFormValues> control={control} name="contact_name" errors={errors} label="Contact name" placeholder="Ada Obi" />
          <FormInput<AddressFormValues> control={control} name="contact_phone" errors={errors} label="Phone" placeholder="0801 234 5678" />
        </div>

        <FormInput<AddressFormValues> control={control} name="contact_email" errors={errors} label="Email (optional)" type="email" placeholder="them@example.com" />
        <FormInput<AddressFormValues> control={control} name="line1" errors={errors} label="Street address" placeholder="12 Marina Road" />
        <FormInput<AddressFormValues> control={control} name="line2" errors={errors} label="Apartment, suite… (optional)" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Country</Label>
            <AppSelect
              placeholder="Country"
              value={country}
              onValueChange={value => {
                setCountry(value ?? "NG");
                setStateCode("");
                setValue("state", "");
                setValue("city", "");
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
                  setValue("state", selected?.name ?? value ?? "", { shouldValidate: true });
                  setValue("city", "");
                }}
                options={states.map(option => ({ label: option.name, value: option.code }))}
              />
            ) : (
              <FormInput<AddressFormValues> control={control} name="state" errors={errors} placeholder="State or region" />
            )}
            {errors.state && states.length > 0 && <p className="text-destructive text-xs">{errors.state.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>City</Label>
            {cities.length > 0 ? (
              <AppSelect placeholder="City" value={cityName || null} onValueChange={value => setValue("city", value ?? "", { shouldValidate: true })} options={cities.map(option => ({ label: option.name, value: option.name }))} />
            ) : (
              <FormInput<AddressFormValues> control={control} name="city" errors={errors} placeholder="City" />
            )}
            {errors.city && cities.length > 0 && <p className="text-destructive text-xs">{errors.city.message}</p>}
          </div>

          <FormInput<AddressFormValues> control={control} name="postal_code" errors={errors} label="Postal code" placeholder="Needed for express rates" />
        </div>
      </form>
    </AppDialog>
  );
};

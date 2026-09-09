"use client";

import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

export const AddressFormDialog = function ({ open, address, onClose }: Props) {
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

  const stateName = watch("state");
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
    const match = states.find((state) => state.name === address.state);
    if (match) setStateCode(match.code);
  }, [address, states]);

  const isEditing = !!address;

  const { mutate: saveAddress, isPending } = useSubmitData<AddressFormValues & { country: string }, unknown>({
    url: isEditing ? API_ENDPOINTS.customer.addresses.update(address.id) : API_ENDPOINTS.customer.addresses.create,
    method: isEditing ? "put" : "post",
    onSuccessMessage: isEditing ? "Address updated" : "Address saved",
    additionalQueryKeys: [[API_ENDPOINTS.customer.addresses.list]],
    onSuccess: onClose,
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit address" : "New address"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Select
                value={country}
                onValueChange={(value) => {
                  setCountry(value);
                  setStateCode("");
                  setValue("state", "");
                  setValue("city", "");
                }}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.flag} {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>State</Label>
              {states.length > 0 ? (
                <Select
                  value={stateCode}
                  onValueChange={(value) => {
                    setStateCode(value);
                    const selected = states.find((state) => state.code === value);
                    setValue("state", selected?.name ?? value, { shouldValidate: true });
                    setValue("city", "");
                  }}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="State">{stateName || undefined}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((option) => (
                      <SelectItem key={option.code} value={option.code}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select value={cityName || ""} onValueChange={(value) => setValue("city", value, { shouldValidate: true })}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <FormInput<AddressFormValues> control={control} name="city" errors={errors} placeholder="City" />
              )}
              {errors.city && cities.length > 0 && <p className="text-destructive text-xs">{errors.city.message}</p>}
            </div>

            <FormInput<AddressFormValues> control={control} name="postal_code" errors={errors} label="Postal code" placeholder="Needed for express rates" />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isEditing ? "Save changes" : "Save address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

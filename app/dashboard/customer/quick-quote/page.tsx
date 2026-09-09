"use client";

import { AppInput } from "@/components/shared/app-input";
import { AppSelect } from "@/components/shared/app-select";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { showToast } from "@/lib/show-toast";
import type { CountryOption, CourierQuote, StateOption } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface LocationState {
  country: string;
  stateCode: string;
  stateName: string;
  city: string;
}

const EMPTY_LOCATION: LocationState = { country: "NG", stateCode: "", stateName: "", city: "" };

const LocationFields = function ({ label, value, onChange }: { label: string; value: LocationState; onChange: (value: LocationState) => void }) {
  const { data: countriesData } = useGetData<APIResponse<CountryOption[]>>({ url: API_ENDPOINTS.customer.lookups.countries });
  const countries = countriesData?.data ?? [];

  const { data: statesData } = useGetData<APIResponse<StateOption[]>>({ url: API_ENDPOINTS.customer.lookups.states(value.country), shouldFetch: !!value.country });
  const states = statesData?.data ?? [];

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label>Country</Label>
          <AppSelect placeholder="Country" value={value.country || null} onValueChange={country => onChange({ country: country ?? "", stateCode: "", stateName: "", city: "" })} options={countries.map(option => ({ label: `${option.flag} ${option.name}`, value: option.code }))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>State</Label>
          {states.length > 0 ? (
            <AppSelect placeholder="State" value={value.stateCode || null} onValueChange={stateCode => onChange({ ...value, stateCode: stateCode ?? "", stateName: states.find(state => state.code === stateCode)?.name ?? stateCode ?? "" })} options={states.map(option => ({ label: option.name, value: option.code }))} />
          ) : (
            <AppInput placeholder="State or region" value={value.stateName} onChange={event => onChange({ ...value, stateName: event.target.value, stateCode: event.target.value })} />
          )}
        </div>
        <AppInput label="City" placeholder="City" value={value.city} onChange={event => onChange({ ...value, city: event.target.value })} />
      </div>
    </div>
  );
};

export default function QuickQuotePage() {
  const [origin, setOrigin] = useState<LocationState>(EMPTY_LOCATION);
  const [destination, setDestination] = useState<LocationState>({ ...EMPTY_LOCATION, country: "" });
  const [weight, setWeight] = useState("");
  const [quotes, setQuotes] = useState<CourierQuote[] | null>(null);

  const { mutate: fetchQuotes, isPending } = useSubmitData<Record<string, unknown>, APIResponse<CourierQuote[]>>({
    url: API_ENDPOINTS.customer.quotes,
    silent: true,
    onSuccess: response => setQuotes(response.data),
  });

  const handleSubmit = function (event: React.FormEvent) {
    event.preventDefault();
    const weightKg = Number(weight);
    if (!origin.stateName || !origin.city) return showToast("warning", "Where is it shipping from?");
    if (!destination.country || !destination.stateName || !destination.city) return showToast("warning", "Where is it going?");
    if (!weightKg || weightKg <= 0) return showToast("warning", "Enter the estimated weight");

    setQuotes(null);
    fetchQuotes({
      origin: { country: origin.country, state: origin.stateName, city: origin.city },
      destination: { country: destination.country, state: destination.stateName, city: destination.city },
      parcel: { weight_kg: weightKg },
    });
  };

  return (
    <div>
      <PageHeader title="Quick quote" description="A rough estimate from route and weight — exact pricing happens at booking." />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <LocationFields label="From" value={origin} onChange={setOrigin} />
        <LocationFields label="To" value={destination} onChange={setDestination} />

        <div className="rounded-2xl border border-line bg-white p-5">
          <AppInput label="Estimated weight (kg)" type="number" min={0.1} step="0.1" placeholder="2.5" value={weight} onChange={event => setWeight(event.target.value)} containerClassName="max-w-48" />
        </div>

        <Button type="submit" size="lg" className="h-11 px-8" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Get quotes
        </Button>
      </form>

      {quotes && (
        <div className="mt-8 max-w-2xl space-y-3">
          {quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rates for this route — a valid destination postal code unlocks express options at booking.</p>
          ) : (
            quotes.map(quote => {
              const etaText = quote.eta_days.min === quote.eta_days.max ? `${quote.eta_days.min} business days` : `${quote.eta_days.min}–${quote.eta_days.max} business days`;
              return (
                <div key={`${quote.courier_code}-${quote.service_code}`} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {quote.courier_name} · {quote.service_name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{etaText}</p>
                  </div>
                  <p className="text-lg font-bold text-brand">{formatNaira(quote.amount_minor)}</p>
                </div>
              );
            })
          )}
          {quotes.length > 0 && (
            <Button size="lg" className="h-11" asChild>
              <Link href="/dashboard/customer/book">Book with real parcel details</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

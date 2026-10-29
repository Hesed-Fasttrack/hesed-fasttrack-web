"use client";

import { AppInput } from "@/components/shared/app-input";
import { AppSelect } from "@/components/shared/app-select";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/table-helpers";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { showToast } from "@/lib/show-toast";
import type { CountryOption, CourierQuote, StateOption } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { Calculator, Loader2 } from "lucide-react";
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
    <div>
      <p className="flex items-center gap-2 text-[13px] font-bold text-foreground">
        <span className="size-2 rounded-full bg-brand ring-4 ring-brand-muted" />
        {label}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label>Country</Label>
          <AppSelect
            placeholder="Country"
            value={value.country || null}
            onValueChange={country => onChange({ country: country ?? "", stateCode: "", stateName: "", city: "" })}
            options={countries.map(option => ({ label: `${option.flag} ${option.name}`, value: option.code }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>State</Label>
          {states.length > 0 ? (
            <AppSelect
              placeholder="State"
              value={value.stateCode || null}
              onValueChange={stateCode => onChange({ ...value, stateCode: stateCode ?? "", stateName: states.find(state => state.code === stateCode)?.name ?? stateCode ?? "" })}
              options={states.map(option => ({ label: option.name, value: option.code }))}
            />
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
      <PageHeader title="Quick quote" description="A rough estimate from route and weight. Exact pricing happens at booking." />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
        <SectionCard title="Route and weight" description="Where it starts, where it lands, and roughly how heavy it is">
          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-5.5">
            <LocationFields label="From" value={origin} onChange={setOrigin} />
            <div className="border-t border-line" />
            <LocationFields label="To" value={destination} onChange={setDestination} />
            <div className="border-t border-line" />
            <AppInput label="Estimated weight (kg)" type="number" min={0.1} step="0.1" placeholder="2.5" value={weight} onChange={event => setWeight(event.target.value)} containerClassName="sm:max-w-48" />

            <Button type="submit" className="h-11 w-full rounded-xl px-8 sm:w-auto" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Get quotes
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Estimated rates" description={quotes && quotes.length > 0 ? `${quotes.length} ${quotes.length === 1 ? "option" : "options"} for this route` : "Fill in the route to compare options"}>
          {isPending ? (
            <div className="space-y-3 p-5 sm:p-5.5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : !quotes ? (
            <EmptyState icon={Calculator} title="Your quotes appear here" message="Prices are estimates until you book with real parcel details." />
          ) : quotes.length === 0 ? (
            <EmptyState icon={Calculator} title="No rates for this route" message="A valid destination postal code unlocks express options at booking." />
          ) : (
            <div className="space-y-3 p-5 sm:p-5.5">
              {quotes.map(quote => {
                const etaText = quote.eta_days.min === quote.eta_days.max ? `${quote.eta_days.min} business days` : `${quote.eta_days.min} to ${quote.eta_days.max} business days`;
                return (
                  <div key={`${quote.courier_code}-${quote.service_code}`} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-canvas p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {quote.courier_name} · {quote.service_name}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-muted">{etaText}</p>
                    </div>
                    <p className="shrink-0 text-lg font-bold text-brand tabular-nums">{formatNaira(quote.amount_minor)}</p>
                  </div>
                );
              })}
              <Button className="mt-1 h-11 w-full rounded-xl" asChild>
                <Link href="/dashboard/customer/book">Book with real parcel details</Link>
              </Button>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

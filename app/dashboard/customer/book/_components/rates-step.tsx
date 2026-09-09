"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/booking";
import type { CourierQuote } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";

export const RatesStep = function () {
  const { senderAddress, receiverAddress, parcels, quote, setQuote, setStep } = useBookingStore();
  const [quotes, setQuotes] = useState<CourierQuote[] | null>(null);

  const { mutate: fetchQuotes, isPending } = useSubmitData<Record<string, unknown>, APIResponse<CourierQuote[]>>({
    url: API_ENDPOINTS.customer.quotes,
    silent: true,
    onSuccess: response => setQuotes(response.data),
  });

  useEffect(() => {
    if (!senderAddress || !receiverAddress) return;
    fetchQuotes({
      origin: { country: senderAddress.country, state: senderAddress.state, city: senderAddress.city, postal_code: senderAddress.postal_code ?? undefined },
      destination: { country: receiverAddress.country, state: receiverAddress.state, city: receiverAddress.city, postal_code: receiverAddress.postal_code ?? undefined },
      parcels,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" onClick={() => setStep("details")}>
        <ArrowLeft />
        Back to details
      </Button>

      {isPending || quotes === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center">
          <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-foreground">No rates for this route</p>
          <p className="mt-1 text-sm text-muted-foreground">Check the addresses — a valid destination postal code unlocks express options.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map(option => {
            const isSelected = quote?.courier_code === option.courier_code && quote?.service_code === option.service_code;
            const etaText = option.eta_days.min === option.eta_days.max ? `${option.eta_days.min} business days` : `${option.eta_days.min}–${option.eta_days.max} business days`;
            return (
              <button
                key={`${option.courier_code}-${option.service_code}`}
                type="button"
                onClick={() => setQuote(option)}
                className={cn("flex w-full items-center justify-between gap-4 rounded-2xl border bg-white p-5 text-left transition-colors", isSelected ? "border-brand bg-brand-muted/30" : "border-line hover:bg-muted")}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {option.courier_name} · {option.service_name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{etaText}</p>
                </div>
                <p className="text-lg font-bold text-brand">{formatNaira(option.amount_minor)}</p>
              </button>
            );
          })}
        </div>
      )}

      <Button size="lg" className="h-11 w-full sm:w-auto sm:px-8" disabled={!quote} onClick={() => setStep("confirm")}>
        Continue
      </Button>
    </div>
  );
};

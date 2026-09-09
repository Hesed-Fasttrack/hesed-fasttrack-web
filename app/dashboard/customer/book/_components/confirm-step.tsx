"use client";

import { OFFICE_ADDRESS } from "@/app/_lib/site";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/booking";
import type { CustomerKycSubmission, Wallet } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { addDays, format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PICKUP_OPTIONS = [1, 2, 3].map(offset => ({
  key: String(offset),
  label: offset === 1 ? `Tomorrow (${format(addDays(new Date(), 1), "EEE d")})` : format(addDays(new Date(), offset), "EEE d MMM"),
  date: addDays(new Date(), offset),
}));

const SummaryRow = function ({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
};

export const ConfirmStep = function () {
  const router = useRouter();
  const { senderAddress, receiverAddress, fulfilmentType, purpose, parcels, quote, setStep, reset } = useBookingStore();
  const [pickupKey, setPickupKey] = useState(PICKUP_OPTIONS[0].key);

  const isDropOff = fulfilmentType === "DROP_OFF";

  const { data: walletData } = useGetData<APIResponse<Wallet>>({ url: API_ENDPOINTS.customer.wallet.balance, shouldFetch: !isDropOff });
  const { data: kycData, isFetching: isFetchingKyc } = useGetData<APIResponse<CustomerKycSubmission | null>>({ url: API_ENDPOINTS.customer.kyc.status, shouldFetch: !isDropOff });

  const isKycVerified = kycData?.data?.status === "APPROVED";
  const isKycPending = kycData?.data?.status === "PENDING";
  const balance = walletData?.data?.available_minor ?? 0;
  const hasEnoughBalance = balance >= (quote?.amount_minor ?? 0);

  const { mutate: bookShipment, isPending: isBooking } = useSubmitData<Record<string, unknown>, unknown>({
    url: API_ENDPOINTS.customer.shipments.create,
    onSuccessMessage: "Shipment booked",
    additionalQueryKeys: [[API_ENDPOINTS.customer.shipments.list()], [API_ENDPOINTS.customer.wallet.balance]],
    onSuccess: () => {
      reset();
      router.push("/dashboard/customer/shipments");
    },
  });

  if (!senderAddress || !receiverAddress || !quote || !purpose || !fulfilmentType) return null;

  const etaText = quote.eta_days.min === quote.eta_days.max ? `${quote.eta_days.min} business days` : `${quote.eta_days.min}–${quote.eta_days.max} business days`;
  const parcelSummary = `${parcels.length} ${parcels.length === 1 ? "box" : "boxes"} · ${parcels.reduce((sum, parcel) => sum + parcel.items.reduce((s, item) => s + item.quantity, 0), 0)} items`;

  const handleBook = function () {
    const pickup = PICKUP_OPTIONS.find(option => option.key === pickupKey);
    bookShipment({
      courier_code: quote.courier_code,
      service_code: quote.service_code,
      sender_address_id: senderAddress.id,
      receiver_address_id: receiverAddress.id,
      purpose,
      fulfilment_type: fulfilmentType,
      parcels,
      pickup_date: isDropOff ? undefined : pickup?.date.toISOString(),
    });
  };

  const isGated = !isDropOff && (!isKycVerified || !hasEnoughBalance);

  return (
    <div className="max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" onClick={() => setStep("rates")}>
        <ArrowLeft />
        Back to rates
      </Button>

      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold text-foreground">Summary</p>
        <div className="mt-2 divide-y divide-line">
          <SummaryRow label="From" value={`${senderAddress.contact_name} — ${senderAddress.line1}, ${senderAddress.city}`} />
          <SummaryRow label="To" value={`${receiverAddress.contact_name} — ${receiverAddress.line1}, ${receiverAddress.city}`} />
          <SummaryRow label="Package" value={parcelSummary} />
          <SummaryRow label="Courier" value={`${quote.courier_name} · ${quote.service_name} (${etaText})`} />
          <SummaryRow label="Fulfilment" value={isDropOff ? "Drop off at our office" : "Courier pickup"} />
        </div>
      </div>

      {isDropOff ? (
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold text-foreground">Drop-off location</p>
          <p className="mt-2 text-sm text-foreground">{OFFICE_ADDRESS.name}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{OFFICE_ADDRESS.lines}</p>
          <p className="mt-2 text-xs text-muted-foreground">No payment now — you pay from your wallet after we verify your parcel at the office.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold text-foreground">Pickup day</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PICKUP_OPTIONS.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => setPickupKey(option.key)}
                className={cn("rounded-full border px-4 py-2 text-sm font-medium transition-colors", pickupKey === option.key ? "border-brand bg-brand-muted text-brand" : "border-line text-muted-foreground hover:bg-muted")}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">When the courier collects your parcel — delivery takes {etaText} from pickup.</p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-brand-muted px-5 py-4">
        <p className="text-sm font-semibold text-foreground">Total</p>
        <p className="text-2xl font-bold text-brand">{formatNaira(quote.amount_minor)}</p>
      </div>

      <p className={cn("text-center text-sm", isGated ? "text-danger" : "text-muted-foreground")}>
        {isDropOff
          ? "No payment now — you pay after we verify your parcel."
          : !isKycVerified
            ? isKycPending
              ? "Your identity verification is under review — you can pay once it's approved."
              : "Verify your identity once to pay for shipments."
            : hasEnoughBalance
              ? `Paid from your wallet · balance ${formatNaira(balance)}`
              : `Your wallet holds ${formatNaira(balance)} — fund it to book this shipment.`}
      </p>

      {!isDropOff && !isKycVerified ? (
        <Button size="lg" className="h-11 w-full" disabled={isFetchingKyc || isKycPending} asChild={!isKycPending}>
          {isKycPending ? "Verification in review" : <Link href="/dashboard/customer/kyc">Verify identity</Link>}
        </Button>
      ) : !isDropOff && !hasEnoughBalance ? (
        <Button size="lg" className="h-11 w-full" asChild>
          <Link href="/dashboard/customer/wallet">Fund wallet</Link>
        </Button>
      ) : (
        <Button size="lg" className="h-11 w-full" onClick={handleBook} disabled={isBooking}>
          {isBooking && <Loader2 className="animate-spin" />}
          Book shipment
        </Button>
      )}
    </div>
  );
};

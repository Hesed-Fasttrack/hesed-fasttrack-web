"use client";

import { OFFICE_ADDRESS } from "@/app/_lib/site";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/booking";
import type { CustomerKycSubmission, CustomerShipment } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { addDays, format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
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
      <span className="text-sm text-foreground-muted">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
};

export const ConfirmStep = function () {
  const router = useRouter();
  const { senderAddress, receiverAddress, fulfilmentType, purpose, packageType, thirdPartySender, senderIdFile, parcels, quote, setStep, reset } = useBookingStore();
  const [pickupKey, setPickupKey] = useState(PICKUP_OPTIONS[0].key);

  const isDropOff = fulfilmentType === "DROP_OFF";

  const { data: kycData } = useGetData<APIResponse<CustomerKycSubmission | null>>({ url: API_ENDPOINTS.customer.kyc.status, shouldFetch: !isDropOff });

  const isKycVerified = kycData?.data?.status === "APPROVED";

  const { mutate: bookShipment, isPending: isBooking } = useSubmitData<Record<string, unknown> | FormData, APIResponse<CustomerShipment>>({
    url: API_ENDPOINTS.customer.shipments.create,
    onSuccessMessage: "Shipment booked",
    onSuccess: response => {
      reset();
      router.push(response?.data?.id ? `/dashboard/customer/shipments/${response.data.id}` : "/dashboard/customer/shipments");
    },
  });

  if (!senderAddress || !receiverAddress || !quote || !purpose || !fulfilmentType) return null;

  const etaText = quote.eta_days.min === quote.eta_days.max ? `${quote.eta_days.min} business days` : `${quote.eta_days.min}–${quote.eta_days.max} business days`;
  const parcelSummary = `${parcels.length} ${parcels.length === 1 ? "box" : "boxes"} · ${parcels.reduce((sum, parcel) => sum + parcel.items.reduce((s, item) => s + item.quantity, 0), 0)} items`;

  const handleBook = function () {
    const pickup = PICKUP_OPTIONS.find(option => option.key === pickupKey);
    const payload = {
      courier_code: quote.courier_code,
      service_code: quote.service_code,
      sender_address_id: senderAddress.id,
      receiver_address_id: receiverAddress.id,
      purpose,
      package_type: packageType ?? "PACKAGE",
      fulfilment_type: fulfilmentType,
      third_party_sender: thirdPartySender,
      parcels,
      pickup_date: isDropOff ? undefined : pickup?.date.toISOString(),
    };

    // The sender's ID travels as multipart with the JSON in a payload field.
    if (thirdPartySender && senderIdFile) {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));
      formData.append("sender_id_document", senderIdFile);
      return bookShipment(formData);
    }

    bookShipment(payload);
  };

  return (
    <div className="max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" className="-ml-2 rounded-lg" onClick={() => setStep("rates")}>
        <ArrowLeft />
        Back to rates
      </Button>

      <div className="rounded-2xl border border-line bg-white p-5 sm:p-5.5">
        <p className="text-[15px] font-bold tracking-tight text-foreground">Summary</p>
        <div className="mt-2 divide-y divide-line">
          <SummaryRow label="From" value={`${senderAddress.contact_name} · ${senderAddress.line1}, ${senderAddress.city}`} />
          <SummaryRow label="To" value={`${receiverAddress.contact_name} · ${receiverAddress.line1}, ${receiverAddress.city}`} />
          <SummaryRow label="Package" value={parcelSummary} />
          <SummaryRow label="Courier" value={`${quote.courier_name} · ${quote.service_name} (${etaText})`} />
          <SummaryRow label="Fulfilment" value={isDropOff ? "Drop off at our office" : "Courier pickup"} />
        </div>
      </div>

      {isDropOff ? (
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-5.5">
          <p className="text-[15px] font-bold tracking-tight text-foreground">Drop-off location</p>
          <p className="mt-2 text-sm text-foreground">{OFFICE_ADDRESS.name}</p>
          <p className="mt-0.5 text-sm text-foreground-muted">{OFFICE_ADDRESS.lines}</p>
          <p className="mt-2 text-xs text-foreground-muted">No payment now. You pay by bank transfer after we verify your parcel at the office.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-5.5">
          <p className="text-[15px] font-bold tracking-tight text-foreground">Pickup day</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PICKUP_OPTIONS.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => setPickupKey(option.key)}
                className={cn("rounded-full border px-4 py-2 text-sm font-medium transition-colors", pickupKey === option.key ? "border-brand bg-brand-muted text-brand" : "border-line text-foreground-muted hover:bg-muted")}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-foreground-muted">When the courier collects your parcel. Delivery takes {etaText} from pickup.</p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-brand-muted px-5 py-4">
        <p className="text-sm font-semibold text-foreground">Total</p>
        <p className="text-2xl font-bold text-brand">{formatNaira(quote.amount_minor)}</p>
      </div>

      <p className="text-center text-sm text-foreground-muted">
        {isDropOff
          ? "No payment now. You pay after we verify your parcel."
          : `Next, pay by bank transfer and upload your receipt. We schedule your pickup once it's confirmed.${isKycVerified ? "" : " You'll need to verify your identity before paying."}`}
      </p>

      <p className="text-center text-xs text-foreground-muted">
        Delivery dates are estimates, not guarantees. Your shipment may arrive earlier or later due to customs clearance, flight or shipping schedule changes, weather or other circumstances beyond our control.
      </p>

      <Button size="lg" className="h-11 w-full rounded-xl" onClick={handleBook} disabled={isBooking}>
        {isBooking && <Loader2 className="animate-spin" />}
        Book shipment
      </Button>
    </div>
  );
};

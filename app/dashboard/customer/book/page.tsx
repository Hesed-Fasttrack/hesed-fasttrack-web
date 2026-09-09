"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useBookingStore } from "@/store/booking";
import { ConfirmStep } from "./_components/confirm-step";
import { DetailsStep } from "./_components/details-step";
import { RatesStep } from "./_components/rates-step";

const STEP_TITLES = {
  details: "What are you shipping?",
  rates: "Compare rates",
  confirm: "Confirm booking",
} as const;

export default function BookShipmentPage() {
  const step = useBookingStore(state => state.step);

  return (
    <div>
      <PageHeader title="New shipment" description={STEP_TITLES[step]} />
      {step === "details" ? <DetailsStep /> : step === "rates" ? <RatesStep /> : <ConfirmStep />}
    </div>
  );
}

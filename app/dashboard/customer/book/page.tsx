"use client";

import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/booking";
import { Check } from "lucide-react";
import { ConfirmStep } from "./_components/confirm-step";
import { DetailsStep } from "./_components/details-step";
import { RatesStep } from "./_components/rates-step";

const STEPS = [
  { key: "details", label: "Details", title: "What are you shipping?" },
  { key: "rates", label: "Rates", title: "Compare rates" },
  { key: "confirm", label: "Confirm", title: "Confirm booking" },
] as const;

export default function BookShipmentPage() {
  const step = useBookingStore(state => state.step);
  const activeIndex = STEPS.findIndex(entry => entry.key === step);

  return (
    <div>
      <PageHeader title="New shipment" description={STEPS[activeIndex].title} />

      <ol className="mb-5 flex max-w-3xl items-center gap-2 rounded-2xl border border-line bg-white p-2">
        {STEPS.map((entry, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <li key={entry.key} className={cn("flex flex-1 items-center gap-2 rounded-xl px-2.5 py-2 sm:px-3", isActive && "bg-brand-muted")}>
              <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", isDone ? "bg-brand text-white" : isActive ? "bg-brand text-white" : "bg-surface-muted text-foreground-muted")}>{isDone ? <Check className="size-3.5" /> : index + 1}</span>
              <span className={cn("truncate text-[13px] font-semibold", isActive ? "text-brand-dark" : isDone ? "text-foreground" : "text-foreground-subtle")}>{entry.label}</span>
            </li>
          );
        })}
      </ol>

      {step === "details" ? <DetailsStep /> : step === "rates" ? <RatesStep /> : <ConfirmStep />}
    </div>
  );
}

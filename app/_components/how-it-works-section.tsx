import { CalendarCheck, MapPin, PackageSearch, Wallet } from "lucide-react";
import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    icon: PackageSearch,
    title: "Get a quote",
    description: "Tell us where it's going and what you're sending — compare courier rates instantly.",
  },
  {
    icon: CalendarCheck,
    title: "Book your shipment",
    description: "Choose courier pickup or drop-off at our office, add your parcel details and pick a date.",
  },
  {
    icon: Wallet,
    title: "Pay from your wallet",
    description: "Fund your wallet once by bank transfer and every booking settles instantly — no card fees.",
  },
  {
    icon: MapPin,
    title: "Track to the door",
    description: "Follow every status from pickup to delivery with real-time updates in the app.",
  },
] as const;

export const HowItWorksSection = function () {
  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How it works" title="From quote to doorstep in four steps" />

        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-muted">
                <step.icon className="h-6 w-6 text-brand" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-foreground-subtle">Step {index + 1}</p>
              <h3 className="mt-1 text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

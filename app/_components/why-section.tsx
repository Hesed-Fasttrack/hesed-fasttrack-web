import { BadgeCheck, Banknote, Clock4, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "./section-heading";

const REASONS = [
  {
    icon: Clock4,
    title: "Fast, reliable timelines",
    description: "Realistic delivery estimates on every quote — and tracking that tells you exactly where your parcel is.",
  },
  {
    icon: Banknote,
    title: "Transparent pricing",
    description: "The price you see on the quote is the price you pay. No hidden charges, no surprises at pickup.",
  },
  {
    icon: ShieldCheck,
    title: "Safe handling",
    description: "Every parcel is verified and documented before it ships, so what leaves Lagos arrives intact.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted courier partners",
    description: "We work with vetted international carriers so your shipment rides on proven networks.",
  },
] as const;

export const WhySection = function () {
  return (
    <section id="why-us" className="bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative hidden h-[520px] overflow-hidden rounded-2xl lg:block">
            <Image src="/images/warehouse.jpg" alt="Parcels stored in a fulfilment warehouse" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>

          <div>
            <SectionHeading eyebrow="Why HESED FastTrack" title="Logistics you don't have to chase" />
            <div className="mt-10 space-y-8">
              {REASONS.map(reason => (
                <div key={reason.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted">
                    <reason.icon className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{reason.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground-muted">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

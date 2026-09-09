import Image from "next/image";
import { SectionHeading } from "./section-heading";

const SERVICES = [
  {
    title: "International shipping",
    description: "Export from Nigeria to over 220 countries by air, with door-to-door delivery and customs-ready documentation.",
    image: "/images/cargo-plane.jpg",
    alt: "Cargo plane on an airport runway",
  },
  {
    title: "Sea & heavy freight",
    description: "Cost-effective sea freight for bulky and commercial cargo between Nigeria, the USA and China.",
    image: "/images/cargo-ship.jpg",
    alt: "Container ship at sea",
  },
  {
    title: "Door-to-door delivery",
    description: "Book a courier pickup or drop your parcel at our office — we verify, ship and deliver straight to the receiver.",
    image: "/images/handover.jpg",
    alt: "A parcel being handed to a customer",
  },
] as const;

export const ServicesSection = function () {
  return (
    <section id="services" className="bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="What we do" title="Every route your parcel needs" description="From a single document to commercial cargo, HESED FastTrack moves it — domestically and across borders." />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {SERVICES.map(service => (
            <article key={service.title} className="group overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative h-52 overflow-hidden">
                <Image src={service.image} alt={service.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-foreground">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

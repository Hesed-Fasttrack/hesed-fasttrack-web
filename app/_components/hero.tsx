import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const STATS = [
  { value: "220+", label: "Countries served" },
  { value: "24/7", label: "Shipment tracking" },
  { value: "₦0", label: "Hidden charges" },
] as const;

export const Hero = function () {
  return (
    <section className="relative isolate overflow-hidden">
      <Image src="/images/hero.jpg" alt="Aerial view of a container port" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-brand-dark/80" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">Shipping & logistics, made simple</p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Ship Faster. Track Easily. <span className="text-[#E4D8F2]">Deliver Safely.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Compare courier rates in seconds, book domestic and international shipments, pay from your wallet and follow every delivery from pickup to doorstep — all in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-7 text-base" asChild>
              <Link href="/auth/signup">Get an instant quote</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-white/40 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href="/dashboard/customer/track">Track a shipment</Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
            {STATS.map(stat => (
              <div key={stat.label}>
                <dt className="text-2xl font-extrabold text-white sm:text-3xl">{stat.value}</dt>
                <dd className="mt-1 text-xs text-white/70 sm:text-sm">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

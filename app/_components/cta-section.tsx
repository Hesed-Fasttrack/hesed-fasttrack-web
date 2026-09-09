import { Button } from "@/components/ui/button";
import Link from "next/link";

export const CtaSection = function () {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand px-6 py-16 text-center sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">Ready to ship your first parcel?</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#E4D8F2]">Create a free account, get an instant quote and have your shipment on its way today — from Lagos to anywhere.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 bg-white px-7 text-base text-brand hover:bg-white/90" asChild>
              <Link href="/auth/signup">Create free account</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-white/40 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href="/support">Talk to our team</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

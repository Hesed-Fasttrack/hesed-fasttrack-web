"use client";

import { OFFICE_ADDRESS, SITE } from "@/app/_lib/site";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { CustomerKycSubmission } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { ArrowRight, BadgeCheck, Building2, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const TrackCard = function () {
  const router = useRouter();
  const [reference, setReference] = useState("");

  const handleSubmit = function (event: React.FormEvent) {
    event.preventDefault();
    const cleaned = reference.trim();
    if (cleaned) router.push(`/dashboard/customer/track?reference=${encodeURIComponent(cleaned)}`);
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-5.5">
      <p className="text-[15px] font-bold tracking-tight text-foreground">Track a shipment</p>
      <p className="mt-0.5 text-[12.5px] text-foreground-muted">Enter a HESED reference or tracking number</p>
      <form onSubmit={handleSubmit} className="mt-3.5 flex gap-2">
        <input
          value={reference}
          onChange={event => setReference(event.target.value)}
          placeholder="e.g. HFT-24X9K2"
          className="h-10.5 min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 text-[13.5px] text-foreground outline-none placeholder:text-foreground-subtle focus:border-brand focus:bg-white focus:ring-3 focus:ring-brand-muted"
        />
        <Button type="submit" aria-label="Track" className="size-10.5 rounded-xl" disabled={!reference.trim()}>
          <ArrowRight />
        </Button>
      </form>
    </section>
  );
};

export const OfficeCard = function () {
  return (
    <section className="rounded-2xl border border-line bg-white p-5.5">
      <p className="text-[15px] font-bold tracking-tight text-foreground">Drop-off office</p>
      <div className="mt-3.5 flex gap-3">
        <div className="flex size-9.5 shrink-0 items-center justify-center rounded-[10px] bg-brand-muted">
          <Building2 className="size-4.5 text-brand" />
        </div>
        <div className="text-[12.5px] text-foreground">
          {OFFICE_ADDRESS.lines}
          <p className="text-foreground-muted">{OFFICE_ADDRESS.hours}</p>
        </div>
      </div>
      <dl className="mt-3.5 divide-y divide-line text-[13px]">
        <div className="flex justify-between gap-3 py-2.5">
          <dt className="text-foreground-muted">{SITE.phones.customerService.label}</dt>
          <dd className="font-semibold text-foreground tabular-nums">{SITE.phones.customerService.number}</dd>
        </div>
        <div className="flex justify-between gap-3 py-2.5">
          <dt className="text-foreground-muted">WhatsApp</dt>
          <dd>
            <a href={SITE.whatsapp.href} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">
              Chat with us
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
};

export const VerificationNote = function () {
  const { data, isFetching } = useGetData<APIResponse<CustomerKycSubmission | null>>({ url: API_ENDPOINTS.customer.kyc.status });
  const status = data?.data?.status;

  if (isFetching && !data) return null;

  if (status === "APPROVED") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-emerald/10 px-4 py-3.5 text-[13px] font-semibold text-emerald">
        <BadgeCheck className="size-4.5 shrink-0" />
        Identity verified. You can book pickups.
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-amber/10 px-4 py-3.5 text-[13px] font-semibold text-amber">
        <Clock className="size-4.5 shrink-0" />
        Your documents are under review.
      </div>
    );
  }

  return (
    <Link href="/dashboard/customer/kyc" className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-[13px] transition-colors hover:border-brand">
      <ShieldAlert className="size-4.5 shrink-0 text-amber" />
      <span className="flex-1">
        <span className="font-semibold text-foreground">{status === "REJECTED" ? "Verification needs attention" : "Verify your identity"}</span>
        <span className="block text-xs text-foreground-muted">Required before you can book pickups</span>
      </span>
      <ArrowRight className="size-4 text-foreground-subtle" />
    </Link>
  );
};

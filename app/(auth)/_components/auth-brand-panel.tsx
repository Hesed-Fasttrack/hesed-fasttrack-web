"use client";

import { SITE } from "@/app/_lib/site";
import { Bell, Calculator, Landmark, MapPin, Plane, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface PanelCopy {
  title: string;
  description: string;
  points?: { icon: LucideIcon; label: string }[];
  showShipment?: boolean;
}

const SIGNIN: PanelCopy = {
  title: "Ship faster.\nTrack easily.\nDeliver safely.",
  description: "International shipping from Lagos, handled end to end. Quote, book, pay and track from one place.",
  points: [
    { icon: Plane, label: "Air and sea freight" },
    { icon: MapPin, label: "Pickup or drop-off" },
    { icon: Landmark, label: "Pay by simple bank transfer" },
  ],
  showShipment: true,
};

const PANELS: Record<string, PanelCopy> = {
  "/auth/signup": {
    title: "Your first shipment is a few minutes away.",
    description: "Create an account to get live quotes in naira, book a pickup or drop-off, and follow every step to the doorstep.",
    points: [
      { icon: Calculator, label: "Instant quotes for air and sea" },
      { icon: Landmark, label: "Pay by bank transfer, no card needed" },
      { icon: Bell, label: "Updates at every handover" },
    ],
  },
  "/auth/verify-email": {
    title: "One last step.",
    description: "Confirming your email keeps your account safe. It takes a few seconds.",
  },
  "/auth/forgot-password": {
    title: "Locked out? We'll get you back in.",
    description: "Reset codes arrive by email and expire after 10 minutes, so only you can change your password.",
  },
  "/auth/reset-password": {
    title: "Almost back in.",
    description: "Pick a strong password you haven't used here before. You'll sign in with it straight after.",
  },
};

export const BrandMark = function () {
  return (
    <span className="flex items-center gap-2.5 text-[15px] font-extrabold tracking-tight text-white">
      <span className="flex size-9 items-center justify-center rounded-[10px] bg-white">
        <Image src="/images/brand-icon.png" alt="" width={28} height={28} className="size-7 rounded-[7px]" />
      </span>
      HESED FastTrack
    </span>
  );
};

const ShipmentPreview = function () {
  return (
    <div className="relative mt-8 w-full rounded-2xl bg-white p-4.5 text-foreground shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11.5px] text-foreground-muted">HFT-7K2M9Q</span>
        <span className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-royal/10 px-2 text-[11px] font-bold text-royal">
          <span className="size-1.25 rounded-full bg-current" />
          In transit
        </span>
      </div>

      <div className="mt-3.5 flex items-center gap-4">
        <div className="shrink-0">
          <p className="text-lg leading-tight font-extrabold tracking-tight">Lagos</p>
          <p className="text-[11px] text-foreground-muted">Ikeja, NG</p>
        </div>
        <div className="relative flex flex-1 items-center justify-center">
          <span className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-line-strong" />
          <span className="relative flex size-7 items-center justify-center rounded-full bg-brand text-white ring-4 ring-white">
            <Plane className="size-3.5" />
          </span>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg leading-tight font-extrabold tracking-tight">London</p>
          <p className="text-[11px] text-foreground-muted">ETA Fri 31 Oct</p>
        </div>
      </div>

      <div className="relative mt-4.5">
        <span className="absolute inset-x-0 top-1.5 h-0.75 rounded-full bg-line" />
        <span className="absolute top-1.5 left-0 h-0.75 w-1/2 rounded-full bg-brand" />
        <ol className="relative grid grid-cols-3 text-[10.5px] font-bold">
          <li className="flex flex-col items-start gap-1.5">
            <span className="size-3.75 rounded-full border-3 border-brand bg-brand" />
            Booked
          </li>
          <li className="flex flex-col items-center gap-1.5">
            <span className="size-3.75 rounded-full border-3 border-brand bg-white shadow-[0_0_0_4px_var(--color-brand-muted)]" />
            In transit
          </li>
          <li className="flex flex-col items-end gap-1.5 text-foreground-muted">
            <span className="size-3.75 rounded-full border-3 border-line-strong bg-white" />
            Delivered
          </li>
        </ol>
      </div>
    </div>
  );
};

export const AuthBrandPanel = function () {
  const pathname = usePathname();
  const copy = PANELS[pathname] ?? SIGNIN;

  return (
    <aside className="sticky top-0 hidden h-dvh p-3.5 lg:block">
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-brand-ink px-9 py-8.5 text-white">
        <span aria-hidden className="pointer-events-none absolute -top-30 -right-40 size-105 rounded-full border border-white/7" />
        <span aria-hidden className="pointer-events-none absolute -top-57 -right-67 size-160 rounded-full border border-white/7" />
        <span aria-hidden className="pointer-events-none absolute -bottom-37 -left-30 size-75 rounded-full border border-white/7" />

        <BrandMark />

        <div className="relative my-auto w-full max-w-110 py-10">
          <h2 className="text-[34px] leading-[1.12] font-extrabold tracking-tight whitespace-pre-line xl:text-[38px]">{copy.title}</h2>
          <p className="mt-3.5 text-[15px] leading-relaxed text-[#cdbbe2]">{copy.description}</p>
          {copy.showShipment && <ShipmentPreview />}
          {copy.points && (
            <ul className="mt-7 flex flex-col gap-3.5">
              {copy.points.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-[13px] font-semibold">
                  <Icon className="size-3.5 text-[#cdbbe2]" />
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative flex justify-between gap-4 border-t border-white/10 pt-4.5 text-xs text-[#cdbbe2]">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span>Support: {SITE.phones.customerService.number}</span>
        </div>
      </div>
    </aside>
  );
};

"use client";

import { SITE } from "@/app/_lib/site";
import { Bell, Calculator, Landmark, MapPin, Plane, Wallet, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface PanelCopy {
  title: string;
  description: string;
  points?: { icon: LucideIcon; label: string }[];
  stackPoints?: boolean;
  showShipment?: boolean;
}

const SIGNIN: PanelCopy = {
  title: "Ship faster.\nTrack easily.\nDeliver safely.",
  description: "International shipping from Lagos, handled end to end. Quote, book, pay and track from one place.",
  points: [
    { icon: Plane, label: "Air and sea freight" },
    { icon: MapPin, label: "Pickup or drop-off" },
    { icon: Wallet, label: "Pay from your wallet" },
  ],
  showShipment: true,
};

const PANELS: Record<string, PanelCopy> = {
  "/auth/signup": {
    title: "Your first shipment is a few minutes away.",
    description: "Create an account to get live quotes in naira, book a pickup or drop-off, and follow every step to the doorstep.",
    points: [
      { icon: Calculator, label: "Instant quotes for air and sea" },
      { icon: Landmark, label: "Your own account number for funding" },
      { icon: Bell, label: "Updates at every handover" },
    ],
    stackPoints: true,
  },
  "/auth/verify-email": {
    title: "One last step.",
    description: "Confirming your email keeps your account and wallet safe. It takes a few seconds.",
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
    <div className="relative mt-7 w-full max-w-100 rounded-2xl bg-white text-foreground shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="font-mono text-[11.5px] text-foreground-muted">HFT-7K2M9Q</span>
        <span className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-royal/10 px-2 text-[11px] font-bold text-royal">
          <span className="size-1.25 rounded-full bg-current" />
          In transit
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 px-4 pt-3 pb-2.5">
        <div>
          <p className="text-lg font-extrabold tracking-tight">Lagos</p>
          <p className="text-[11px] text-foreground-muted">Ikeja, NG</p>
        </div>
        <div className="relative w-20 border-t-2 border-dashed border-line-strong">
          <span className="absolute top-1/2 left-[60%] flex size-6.5 -translate-x-1/2 -translate-y-[55%] items-center justify-center rounded-full bg-brand text-white ring-3 ring-white">
            <Plane className="size-3.5" />
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold tracking-tight">London</p>
          <p className="text-[11px] text-foreground-muted">ETA Fri 31 Oct</p>
        </div>
      </div>
      <div className="mx-4 mb-3.5 h-1 rounded-full bg-line">
        <div className="h-full w-[55%] rounded-full bg-brand" />
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

        <div className="relative mt-auto">
          <h2 className="text-[34px] leading-[1.12] font-extrabold tracking-tight whitespace-pre-line">{copy.title}</h2>
          <p className="mt-3 max-w-100 text-[15px] leading-relaxed text-[#cdbbe2]">{copy.description}</p>
          {copy.showShipment && <ShipmentPreview />}
          {copy.points && (
            <ul className={copy.stackPoints ? "mt-7 flex flex-col gap-3.5" : "mt-6.5 flex flex-wrap gap-x-5.5 gap-y-3"}>
              {copy.points.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-[13px] font-semibold">
                  <Icon className="size-3.5 text-[#cdbbe2]" />
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative mt-6.5 flex justify-between border-t border-white/10 pt-4.5 text-xs text-[#cdbbe2]">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span>Support: {SITE.phones.customerService.number}</span>
        </div>
      </div>
    </aside>
  );
};

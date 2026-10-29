"use client";

import { SITE } from "@/app/_lib/site";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./auth-brand-panel";

const SWITCHES: Record<string, { prompt: string; label: string; href: string }> = {
  "/auth/signin": { prompt: "New here?", label: "Create an account", href: "/auth/signup" },
  "/auth/signup": { prompt: "Already have an account?", label: "Sign in", href: "/auth/signin" },
};

export const AuthBand = function () {
  return (
    <div className="relative mx-3 mt-3 flex items-center justify-between overflow-hidden rounded-[20px] bg-brand-ink px-4.5 py-4 lg:hidden">
      <span aria-hidden className="pointer-events-none absolute -top-22 -right-20 size-55 rounded-full border border-white/8" />
      <Link href="/" className="relative">
        <BrandMark />
      </Link>
      <span className="relative text-xs text-[#cdbbe2]">Ship faster.</span>
    </div>
  );
};

export const AuthTopline = function () {
  const pathname = usePathname();
  const switcher = SWITCHES[pathname];

  if (switcher) {
    return (
      <p className="hidden justify-end gap-1.5 px-14 pt-6.5 text-[13px] text-foreground-muted lg:flex">
        {switcher.prompt}
        <Link href={switcher.href} className="font-bold text-brand hover:underline">
          {switcher.label}
        </Link>
      </p>
    );
  }

  return (
    <div className="px-5 pt-5 sm:px-10 lg:px-14 lg:pt-6.5">
      <Link href="/auth/signin" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground-muted transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </Link>
    </div>
  );
};

export const AuthSwitchLink = function () {
  const pathname = usePathname();
  const switcher = SWITCHES[pathname];
  if (!switcher) return null;

  return (
    <p className="mt-5 text-center text-[13px] text-foreground-muted lg:hidden">
      {switcher.prompt}{" "}
      <Link href={switcher.href} className="font-bold text-brand hover:underline">
        {switcher.label}
      </Link>
    </p>
  );
};

export const AuthFooter = function () {
  return (
    <footer className="flex flex-col items-center gap-1.5 px-5 pt-6 pb-6 text-center text-[11.5px] text-foreground-muted sm:flex-row sm:justify-between sm:px-10 lg:flex-col lg:px-14 xl:flex-row">

      <span>
        By continuing you agree to our{" "}
        <Link href="/terms-and-conditions" className="font-semibold hover:text-foreground">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="font-semibold hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </span>
      <a href={SITE.whatsapp.href} target="_blank" rel="noreferrer" className="font-semibold hover:text-foreground">
        Need help? WhatsApp us
      </a>
    </footer>
  );
};

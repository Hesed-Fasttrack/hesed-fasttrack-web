import { buildPageMetadata } from "@/app/_lib/metadata";
import { Suspense } from "react";
import { AuthBrandPanel } from "./_components/auth-brand-panel";
import { AuthBand, AuthFooter, AuthSwitchLink, AuthTopline } from "./_components/auth-chrome";

export const metadata = buildPageMetadata({
  path: "/auth",
  title: "Sign in",
  description: "Sign in or create a HESED FastTrack account to ship, pay and track from one place.",
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[clamp(440px,42vw,600px)_1fr]">
      <AuthBrandPanel />
      <div className="flex min-h-dvh flex-col">
        <AuthBand />
        <AuthTopline />
        <main className="mx-auto flex w-full max-w-100 flex-1 flex-col justify-center px-5 py-8">
          <Suspense fallback={null}>{children}</Suspense>
          <AuthSwitchLink />
        </main>
        <AuthFooter />
      </div>
    </div>
  );
}

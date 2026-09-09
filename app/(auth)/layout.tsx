import { buildPageMetadata } from "@/app/_lib/metadata";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = buildPageMetadata({
  path: "/auth",
  title: "Sign in",
  description: "Sign in or create a HESED FastTrack account to ship, pay and track from one place.",
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <Link href="/" className="mb-8">
        <Image src="/images/logo.png" alt="HESED FastTrack" width={180} height={48} className="h-11 w-auto" priority />
      </Link>
      <main className="w-full max-w-md">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  );
}

import { Footer } from "@/app/_components/footer";
import { Header } from "@/app/_components/header";
import { buildPageMetadata } from "@/app/_lib/metadata";
import { SITE } from "@/app/_lib/site";
import { AlertTriangle } from "lucide-react";

export const metadata = buildPageMetadata({
  path: "/delete-account",
  title: "Delete your account",
  description: "How to permanently delete your HESED FastTrack account and the data removed with it.",
});

const IN_APP_STEPS = ["Open the HESED FastTrack app and sign in.", "Go to the Profile tab.", "Scroll to the Danger zone and tap 'Delete account'.", "Confirm with your password. Deletion is immediate and permanent."] as const;

const REMOVED_DATA = [
  "Your profile — name, email, phone number and photo.",
  "Saved sender and receiver addresses.",
  "Wallet, transaction history and withdrawal records (subject to records we must keep by law).",
  "Identity verification documents.",
  "Notifications and device tokens.",
] as const;

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Delete your account</h1>
        <p className="mt-4 leading-relaxed text-foreground-muted">You can permanently delete your HESED FastTrack account and its data at any time. Withdraw any wallet balance first — it cannot be recovered after deletion.</p>

        <div className="mt-8 flex gap-3 rounded-2xl border border-amber/30 bg-amber/5 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
          <p className="text-sm leading-relaxed text-foreground-muted">Deletion is permanent. Shipments in transit will still be delivered, but you'll lose access to their tracking and history.</p>
        </div>

        <h2 className="mt-12 text-xl font-bold text-foreground">Delete from the app</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-foreground-muted">
          {IN_APP_STEPS.map(step => (
            <li key={step} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-xl font-bold text-foreground">Or request deletion by email</h2>
        <p className="mt-3 leading-relaxed text-foreground-muted">
          If you can't access the app, email{" "}
          <a href={`mailto:${SITE.supportEmail}?subject=Account%20deletion%20request`} className="font-medium text-brand hover:underline">
            {SITE.supportEmail}
          </a>{" "}
          from the address on your account with the subject "Account deletion request". We'll verify it's you and complete the deletion within 7 days.
        </p>

        <h2 className="mt-12 text-xl font-bold text-foreground">What gets deleted</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-foreground-muted">
          {REMOVED_DATA.map(item => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-foreground-subtle">Financial records are retained only for the period required by Nigerian law, then destroyed.</p>
      </main>
      <Footer />
    </div>
  );
}

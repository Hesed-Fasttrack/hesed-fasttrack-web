import { Footer } from "@/app/_components/footer";
import { Header } from "@/app/_components/header";
import { buildPageMetadata } from "@/app/_lib/metadata";
import { SITE } from "@/app/_lib/site";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const metadata = buildPageMetadata({
  path: "/support",
  title: "Support",
  description: "Contact HESED FastTrack: customer service, sales lines, office addresses and common questions.",
});

const FAQS = [
  {
    q: "How do I ship a package?",
    a: "Sign in, get a quote with your route and parcel details, then compare courier prices. Pick a rate and book with 'Drop off at our office'. Once we receive and verify your parcel, pay by bank transfer, upload your receipt and shipping begins once we confirm it.",
  },
  {
    q: "How do I pay for a shipment?",
    a: "By direct bank transfer. Open the shipment, transfer the amount shown to our company account using your shipment reference as the narration, then upload the receipt. We confirm it and let you know.",
  },
  {
    q: "Can I drop my parcel off instead of booking a pickup?",
    a: "Yes. Choose 'Drop off at our office' when booking. We verify your parcel at the office, then you pay by bank transfer and shipping begins once we confirm your receipt.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Any unpaid shipment still awaiting pickup or drop-off can be cancelled from its detail screen. If you've already paid, contact support and we'll refund you by bank transfer.",
  },
  {
    q: "How long does payment confirmation take?",
    a: "We check every receipt against our bank account, usually within working hours on the same day. You'll get a notification as soon as your payment is confirmed.",
  },
  {
    q: "Which countries do you ship to?",
    a: "We ship from Nigeria to over 220 countries by air, with sea freight available on the Nigeria–USA–China corridor.",
  },
] as const;

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Support</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-foreground-muted">We're here to help. Reach us by email, phone or in person at either of our Lagos locations.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-canvas p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted">
              <Mail className="h-5 w-5 text-brand" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">Email us</h2>
            <a href={`mailto:${SITE.supportEmail}`} className="mt-1 block text-sm font-medium text-brand hover:underline">
              {SITE.supportEmail}
            </a>
            <p className="mt-2 text-sm text-foreground-muted">We reply within one business day.</p>
          </div>

          <div className="rounded-2xl border border-line bg-canvas p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted">
              <Phone className="h-5 w-5 text-brand" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">Call us</h2>
            <ul className="mt-1 space-y-1.5 text-sm text-foreground-muted">
              {Object.values(SITE.phones).map(phone => (
                <li key={phone.number}>
                  <span className="font-medium text-foreground">{phone.label}:</span> {phone.number}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-canvas p-6 md:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted">
              <MessageCircle className="h-5 w-5 text-brand" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">Chat on WhatsApp</h2>
            <a href={SITE.whatsapp.href} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm font-medium text-brand hover:underline">
              {SITE.whatsapp.display}
            </a>
            <p className="mt-2 text-sm text-foreground-muted">Message us directly. Fastest during business hours.</p>
          </div>

          <div className="rounded-2xl border border-line bg-canvas p-6 md:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted">
              <MapPin className="h-5 w-5 text-brand" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">Visit or drop off a parcel</h2>
            <div className="mt-3 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Operations base</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground-muted">{SITE.addresses.operations}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Office</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground-muted">{SITE.addresses.office}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mt-16 text-2xl font-extrabold text-foreground">Common questions</h2>
        <div className="mt-6 divide-y divide-line rounded-2xl border border-line">
          {FAQS.map(faq => (
            <div key={faq.q} className="p-6">
              <h3 className="text-base font-bold text-foreground">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

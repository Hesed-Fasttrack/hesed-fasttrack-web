import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SITE } from "../_lib/site";

const FOOTER_LINKS = {
  Company: [
    { label: "Support", href: "/support" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Delete account", href: "/delete-account" },
  ],
  Shipping: [
    { label: "Get a quote", href: "/auth/signup" },
    { label: "Track a shipment", href: "/auth/signin" },
    { label: "Sign in", href: "/auth/signin" },
  ],
} as const;

export const Footer = function () {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Image src="/images/logo.png" alt="HESED FastTrack" width={160} height={44} className="h-10 w-auto rounded bg-white p-1" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{SITE.tagline} Domestic and international shipping from Nigeria to over 220 countries.</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {SITE.socials.map(social => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">{heading}</h3>
            <ul className="mt-4 space-y-2.5">
              {links.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/80 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              <a href={`mailto:${SITE.supportEmail}`} className="hover:text-white">
                {SITE.supportEmail}
              </a>
            </li>
            {Object.values(SITE.phones).map(phone => (
              <li key={phone.number} className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <span>
                  {phone.label}: {phone.number}
                </span>
              </li>
            ))}
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              <span>{SITE.addresses.operations}</span>
            </li>
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              <span>{SITE.addresses.office}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/50 sm:px-6 lg:px-8">© {new Date().getFullYear()} HESED FastTrack. All rights reserved.</p>
      </div>
    </footer>
  );
};

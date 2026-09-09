import type { LegalSection } from "@/components/shared/legal-page";

export const TERMS_INTRO =
  "These Terms and Conditions govern your use of HESED FastTrack's website, mobile app and shipping services. By creating an account or booking a shipment you agree to these terms. If you do not agree, please do not use the service.";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "The service",
    paragraphs: [
      "HESED FastTrack arranges domestic and international carriage of parcels through vetted courier partners. Quotes shown before booking are estimates based on the details you provide; the final charge is confirmed at booking and, for drop-off shipments, after our office verifies the parcel's actual weight and dimensions.",
    ],
  },
  {
    heading: "Your account",
    bullets: [
      "You must provide accurate information and keep your login credentials confidential.",
      "You are responsible for all activity on your account.",
      "Identity verification (KYC) is required before payments can be made. We may refuse or revoke verification where documents are invalid or fraudulent.",
      "We may suspend accounts involved in fraud, abuse or breach of these terms.",
    ],
  },
  {
    heading: "Bookings, pickup and drop-off",
    bullets: [
      "Courier pickup bookings are paid from your wallet at the time of booking.",
      "Drop-off bookings are paid after our office receives and verifies your parcel. If the verified weight or dimensions differ from what you declared, the price may be adjusted before payment.",
      "You must declare parcel contents truthfully. Misdeclared shipments may be delayed, returned or handed to authorities.",
    ],
  },
  {
    heading: "Prohibited items",
    paragraphs: ["You may not ship items prohibited by law or by our courier partners, including but not limited to:"],
    bullets: [
      "Illegal drugs, narcotics and controlled substances.",
      "Firearms, ammunition, explosives and weapons.",
      "Currency, bullion and negotiable instruments.",
      "Perishables and live animals (unless expressly agreed in writing).",
      "Counterfeit goods and items infringing intellectual property.",
      "Hazardous or flammable materials, including loose lithium batteries.",
    ],
  },
  {
    heading: "Wallet, payments and refunds",
    bullets: [
      "Your wallet is funded by bank transfer to your dedicated account number. Wallet balances are not interest-bearing.",
      "Shipments cancelled before pickup are refunded in full to your wallet.",
      "Wallet withdrawals are paid to a verified bank account in your name and may take up to two business days.",
      "Fees charged by payment providers for funding may be passed on at the prevailing rate.",
    ],
  },
  {
    heading: "Delivery times and liability",
    bullets: [
      "Delivery estimates are given in business days and start from pickup or drop-off verification, not from booking.",
      "We are not liable for delays caused by customs inspection, force majeure, incorrect addresses or the consignee's unavailability.",
      "Our liability for loss or damage is limited to the declared value of the shipment or the courier partner's applicable limit, whichever is lower.",
      "Claims must be raised within 7 days of delivery (or expected delivery) via our support channels.",
    ],
  },
  {
    heading: "Account deletion",
    paragraphs: [
      "You may delete your account at any time from the app's settings. Deletion is permanent and removes your profile, addresses, wallet history and documents, subject to records we must keep by law. Any wallet balance should be withdrawn before deletion.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: ["We may update these terms from time to time. Material changes will be announced in the app or by email, and continued use after the effective date constitutes acceptance."],
  },
  {
    heading: "Governing law",
    paragraphs: ["These terms are governed by the laws of the Federal Republic of Nigeria, and disputes are subject to the jurisdiction of the Nigerian courts."],
  },
  {
    heading: "Contact",
    paragraphs: ["For questions about these terms, email support@hesedfasttrack.com or call 0807 064 8120."],
  },
];

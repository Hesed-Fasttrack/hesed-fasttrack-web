import type { LegalSection } from "@/components/shared/legal-page";

export const PRIVACY_POLICY_INTRO =
  'HESED FastTrack ("we", "us", "our") provides shipping and logistics services through our website, mobile app and offices. This policy explains what personal data we collect, why we collect it, and the choices you have. By using our services you agree to the practices described here.';

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    heading: "Information we collect",
    bullets: [
      "Account information: your name, email address, phone number and password when you create an account.",
      "Shipment information: sender and receiver names, addresses, phone numbers and parcel contents you provide when requesting quotes or booking shipments.",
      "Identity verification (KYC): a government-issued ID (NIN, driver's licence or international passport), the document number, a photo of the document and a proof of address, required before payments can be made on the platform.",
      "Payment information: the bank transfer receipts you upload and the name on the paying account, used to confirm your payments and arrange any refunds.",
      "Device and usage information: device identifiers, push notification tokens and app usage data used to operate and improve the service.",
    ],
  },
  {
    heading: "How we use your information",
    bullets: [
      "To provide quotes, book shipments, process payments and deliver parcels.",
      "To verify your identity as required by our courier and payment partners and applicable regulations.",
      "To send you service messages (booking confirmations, payment confirmations and delivery status updates) by push notification and email.",
      "To respond to support requests and resolve disputes.",
      "To prevent fraud, enforce our terms and comply with legal obligations.",
    ],
  },
  {
    heading: "Who we share it with",
    bullets: [
      "Courier partners, to the extent needed to move your shipment (names, addresses, phone numbers and customs information).",
      "Our bank, to receive your payments and send any refunds.",
      "Regulators, customs authorities and law enforcement where the law requires it.",
      "We never sell your personal data to anyone.",
    ],
  },
  {
    heading: "Data retention",
    paragraphs: [
      "We keep your account data for as long as your account exists. Shipment and financial records are retained for the period required by Nigerian tax and anti-money-laundering law, after which they are deleted or anonymised. Unverified accounts are deleted automatically after seven days.",
    ],
  },
  {
    heading: "Your rights",
    bullets: [
      "Access and update your profile information at any time from the app.",
      "Delete your account, and with it your personal data, from the app's settings or by following the steps on our Delete Account page.",
      "Withdraw consent to non-essential communications at any time.",
      "Contact us to request a copy or correction of the data we hold about you.",
    ],
  },
  {
    heading: "Security",
    paragraphs: ["Data is encrypted in transit, passwords are stored hashed, and access to production systems is restricted. Identity documents are stored with a secure media provider and are only visible to our verification team."],
  },
  {
    heading: "Contact",
    paragraphs: ["Questions about this policy or your data? Email support@hesedfastrack.com or visit our Support page for phone contacts and office addresses."],
  },
];

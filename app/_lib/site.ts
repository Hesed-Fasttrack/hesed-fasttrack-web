export const SITE = {
  name: "HESED FastTrack",
  tagline: "Ship Faster. Track Easily. Deliver Safely.",
  supportEmail: "support@hesedfastrack.com",
  phones: {
    customerService: { label: "Customer service", number: "0807 064 8120" },
    salesOyin: { label: "Sales — Oyin", number: "0708 224 5801" },
    salesPrecious: { label: "Sales — Precious", number: "0913 836 2185" },
  },
  addresses: {
    operations: "Shop 5, NAHCO Export Car Park, Murtala Muhammed International Airport Road, Ikeja, Lagos, Nigeria",
    office: "14/16, Isolo Way, Beside UBA Bank, Lagos, Nigeria",
  },
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/hesedfasttrack" },
    { label: "TikTok", href: "https://www.tiktok.com/@hesedfastrack" },
    { label: "Facebook", href: "https://www.facebook.com/share/1As5wXN7th" },
    { label: "WhatsApp", href: "https://wa.me/2348070648120" },
  ],
} as const;

// Drop-off point for the drop-off fulfilment flow — confirm the exact
// location with the client (assumed: the office address).
export const OFFICE_ADDRESS = {
  name: "HESED FastTrack Office",
  lines: SITE.addresses.office,
  hours: "Mon–Fri, 9am–5pm",
} as const;

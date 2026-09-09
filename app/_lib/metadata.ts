import type { Metadata, Viewport } from "next";

const SITE_NAME = "HESED FastTrack";
const SITE_DESCRIPTION = "Ship faster, track easily, deliver safely. Compare courier rates, book domestic and international shipments, and track every delivery from one place.";
const SITE_URL = "https://hesedfasttrack.com";

export const viewport: Viewport = {
  themeColor: "#6D2FA4",
  width: "device-width",
  initialScale: 1,
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Ship Faster. Track Easily. Deliver Safely.`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Ship Faster. Track Easily. Deliver Safely.`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
};

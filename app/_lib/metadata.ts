import type { Metadata, Viewport } from "next";

const SITE_NAME = "HESED FastTrack";
const SITE_DESCRIPTION = "Ship faster, track easily, deliver safely. Compare courier rates, book domestic and international shipments, and track every delivery from one place.";
const SITE_URL = "https://hesedfastrack.com";

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

export const buildPageMetadata = function (page: { path: string; title: string; description: string }): Metadata {
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `${SITE_URL}${page.path}` },
    openGraph: {
      title: `${page.title} · ${SITE_NAME}`,
      description: page.description,
      url: `${SITE_URL}${page.path}`,
    },
  };
};

import { buildPageMetadata } from "@/app/_lib/metadata";
import { LegalPage } from "@/components/shared/legal-page";
import { TERMS_INTRO, TERMS_SECTIONS } from "./_components/sections";

export const metadata = buildPageMetadata({
  path: "/terms-and-conditions",
  title: "Terms & Conditions",
  description: "The terms governing HESED FastTrack's shipping and logistics services.",
});

export default function TermsAndConditionsPage() {
  return <LegalPage title="Terms & Conditions" updated="9 September 2026" intro={TERMS_INTRO} sections={TERMS_SECTIONS} />;
}

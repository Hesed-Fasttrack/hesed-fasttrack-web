import { buildPageMetadata } from "@/app/_lib/metadata";
import { LegalPage } from "@/components/shared/legal-page";
import { PRIVACY_POLICY_INTRO, PRIVACY_POLICY_SECTIONS } from "./_components/sections";

export const metadata = buildPageMetadata({
  path: "/privacy-policy",
  title: "Privacy Policy",
  description: "How HESED FastTrack collects, uses and protects your personal data.",
});

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy Policy" updated="9 September 2026" intro={PRIVACY_POLICY_INTRO} sections={PRIVACY_POLICY_SECTIONS} />;
}

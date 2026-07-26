import { ConsolePlaceholder } from "@/components/admin/console-placeholder";

export const metadata = { title: "Marketing" };

export default function MarketingPage() {
  return (
    <ConsolePlaceholder
      eyebrow="Growth"
      title="Marketing"
      intro="Promotions, content, and the branded newsletter — all within UK vaping advertising-law constraints, with compliance approval on regulated content."
      phase="Phase 8 (Engagement)"
      features={[
        "Promotions engine (priced through the duty/VAT engine)",
        "Headless CMS with draft → compliance-approve → publish",
        "Block-based newsletter composer on the email design system",
        "Governed audience segments (verified, opted-in only)",
        "Post-send reporting: opens, clicks, revenue attributed",
        "Verified-purchase reviews with a moderation queue",
      ]}
    />
  );
}

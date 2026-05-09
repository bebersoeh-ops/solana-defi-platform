import type { Metadata } from "next";
import { SectionShell } from "@/components/shell/section-shell";
import { SectionOverview } from "@/components/shell/section-overview";
import { SECTIONS } from "@/lib/navigation";
import { AnalyticsHero } from "@/components/analytics/hero";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  const section = SECTIONS.find((s) => s.href === "/analytics")!;
  return (
    <SectionShell
      title="Analytics"
      description={section.description}
      badge="Realtime"
      baseHref="/analytics"
    >
      <div className="space-y-5">
        <AnalyticsHero />
        <SectionOverview baseHref={section.href} />
      </div>
    </SectionShell>
  );
}

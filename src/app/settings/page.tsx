import type { Metadata } from "next";
import { SectionShell } from "@/components/shell/section-shell";
import { SectionOverview } from "@/components/shell/section-overview";
import { UTILITY_SECTIONS } from "@/lib/navigation";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  const section = UTILITY_SECTIONS.find((s) => s.href === "/settings")!;
  return (
    <SectionShell
      title="Settings"
      description={section.description}
      badge="Personalize"
      baseHref="/settings"
    >
      <SectionOverview baseHref={section.href} />
    </SectionShell>
  );
}

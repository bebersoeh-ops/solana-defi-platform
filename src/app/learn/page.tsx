import type { Metadata } from "next";
import { SectionShell } from "@/components/shell/section-shell";
import { SectionOverview } from "@/components/shell/section-overview";
import { SECTIONS } from "@/lib/navigation";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  const section = SECTIONS.find((s) => s.href === "/learn")!;
  return (
    <SectionShell
      title="Learn"
      description={section.description}
      badge="Docs"
      baseHref="/learn"
    >
      <SectionOverview baseHref={section.href} />
    </SectionShell>
  );
}

import type { Metadata } from "next";
import { SectionShell } from "@/components/shell/section-shell";
import { SectionOverview } from "@/components/shell/section-overview";
import { SECTIONS } from "@/lib/navigation";

export const metadata: Metadata = { title: "Wallet Tools" };

export default function ToolsPage() {
  const section = SECTIONS.find((s) => s.href === "/tools")!;
  return (
    <SectionShell
      title="Wallet Tools"
      description={section.description}
      badge="Power user"
      baseHref="/tools"
    >
      <SectionOverview baseHref={section.href} />
    </SectionShell>
  );
}

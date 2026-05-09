import type { Metadata } from "next";
import { SectionShell } from "@/components/shell/section-shell";
import { SectionOverview } from "@/components/shell/section-overview";
import { SECTIONS } from "@/lib/navigation";
import { PortfolioHeroSummary } from "@/components/portfolio/hero-summary";

export const metadata: Metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  const section = SECTIONS.find((s) => s.href === "/portfolio")!;
  return (
    <SectionShell
      title="Portfolio"
      description={section.description}
      badge="Multi-wallet"
      baseHref="/portfolio"
    >
      <div className="space-y-5">
        <PortfolioHeroSummary />
        <SectionOverview baseHref={section.href} />
      </div>
    </SectionShell>
  );
}

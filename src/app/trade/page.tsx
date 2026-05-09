import type { Metadata } from "next";
import { SectionShell } from "@/components/shell/section-shell";
import { SectionOverview } from "@/components/shell/section-overview";
import { SECTIONS } from "@/lib/navigation";
import { SwapCard } from "@/components/swap/swap-card";

export const metadata: Metadata = {
  title: "Trade",
  description: "Swap and trade across every Solana DEX through Jupiter.",
};

export default function TradePage() {
  const section = SECTIONS.find((s) => s.href === "/trade")!;
  return (
    <SectionShell
      title="Trade"
      description={section.description}
      badge="Powered by Jupiter"
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <SwapCard compact />
        </div>
        <div className="lg:col-span-2">
          <SectionOverview baseHref={section.href} />
        </div>
      </div>
    </SectionShell>
  );
}

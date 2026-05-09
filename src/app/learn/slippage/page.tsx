import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Article } from "@/components/learn/article";

export default function SlippageEducationPage() {
  const section = SECTIONS.find((s) => s.href === "/learn")!;
  return (
    <SectionShell
      title="Slippage Education"
      description="What slippage really is, why it matters, and how to set it intelligently."
      badge="Trading"
      baseHref="/learn"
    >
      <Article
        level="Intermediate"
        readTime="6 min"
        title="Slippage 101 (the version that actually helps you)"
        subtitle="Most DeFi tutorials hand-wave this number. Here's the actually useful explanation."
        sections={[
          {
            heading: "1. The problem slippage solves",
            body:
              "Between 'quote' and 'execution', the price can drift. Without a slippage tolerance, your transaction would revert on tiny moves. Slippage = how much pain you'll accept before the chain refuses to fill you.",
          },
          {
            heading: "2. Why too tight hurts",
            body:
              "Set 0.05% on a memecoin and your tx will revert constantly, burning fees. Set 0.05% on SOL/USDC during normal markets and you're probably fine.",
          },
          {
            heading: "3. Why too loose hurts more",
            body:
              "Slippage is a sandwich attack's favorite buffet. The wider you set it, the more profit a searcher can extract from your trade. Always set the minimum that gets you filled.",
          },
          {
            heading: "4. A practical heuristic",
            body:
              "Stable pairs: 0.05–0.20%. Blue-chip volatile: 0.30–0.80%. Memecoins: 1.5–3%. Anything wider, split your order. Lumen's adaptive mode will pick reasonable defaults per pair.",
          },
        ]}
      />
    </SectionShell>
  );
}

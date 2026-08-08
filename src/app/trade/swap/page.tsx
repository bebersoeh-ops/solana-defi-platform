import type { Metadata } from "next";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { SwapCard } from "@/components/swap/swap-card";
import { SwapHistory } from "@/components/swap/swap-history";
import { FavoriteTokens } from "@/components/swap/favorite-tokens";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingMarquee } from "@/components/home/trending-marquee";

export const metadata: Metadata = {
  title: "Swap",
  description: "Instant best-route Solana swaps through Jupiter.",
};

export default function SwapPage() {
  const section = SECTIONS.find((s) => s.href === "/trade")!;
  return (
    <SectionShell
      title="Swap"
      description="Best-route swaps across every Solana DEX. Quotes auto-refresh every 12s; sign with your wallet to broadcast on mainnet."
      badge="Live · mainnet"
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <SwapCard />
          <FavoriteTokens />
        </div>
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Why route through Jupiter?</CardTitle>
              <CardDescription>
                Aggregates 30+ Solana DEXes — Raydium, Orca, Phoenix, Meteora, Lifinity, Saber and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <Bullet>Auto-splits orders across pools to minimize price impact.</Bullet>
              <Bullet>Auto-detects intermediate hops (USDC, SOL, JitoSOL) for tighter spreads.</Bullet>
              <Bullet>Routes refresh every few seconds against live liquidity.</Bullet>
              <Bullet>You sign locally — Lumen never custodies funds.</Bullet>
            </CardContent>
          </Card>
          <TrendingMarquee />
          <SwapHistory />
        </div>
      </div>
    </SectionShell>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="size-1.5 rounded-full bg-primary mt-1.5" />
      <span>{children}</span>
    </div>
  );
}

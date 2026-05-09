"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid3x3 } from "lucide-react";
import { useMarketTokens } from "@/hooks/use-market-tokens";
import { formatCompact } from "@/lib/utils";

export default function HeatmapPage() {
  const { tokens, isLoading, lastUpdated } = useMarketTokens();
  const data = useMemo(
    () => [...tokens].sort((a, b) => b.marketCap - a.marketCap),
    [tokens],
  );

  return (
    <SectionShell
      title="Solana Ecosystem Heatmap"
      description="Visual grid of recent performance, sized by market cap and colored by 24h change."
      badge={isLoading ? "Loading" : "Live · 24h"}
      baseHref="/analytics"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="size-4 text-primary" />
            Heatmap
          </CardTitle>
          <CardDescription>
            {lastUpdated
              ? `Hover for details · live data via DexScreener · refreshed ${new Date(lastUpdated).toLocaleTimeString()}`
              : "Loading live data from DexScreener…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {isLoading && data.length === 0
              ? Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-[78px] rounded-xl" />
                ))
              : data.map((t) => {
                  const intensity = Math.min(0.85, Math.abs(t.change24h) / 20);
                  const color = t.change24h >= 0
                    ? `rgba(56, 248, 173, ${intensity})`
                    : `rgba(248, 113, 113, ${intensity})`;
                  const ring =
                    t.change24h >= 5
                      ? "ring-emerald-400/40"
                      : t.change24h <= -5
                        ? "ring-rose-400/40"
                        : "ring-white/5";
                  return (
                    <div
                      key={t.address}
                      className={`group rounded-xl border border-white/[0.06] p-3 transition-all hover:scale-[1.02] cursor-pointer ring-1 ${ring}`}
                      style={{ background: `linear-gradient(180deg, ${color} 0%, rgba(10,12,18,0.4) 100%)` }}
                    >
                      <div className="text-sm font-semibold">{t.symbol}</div>
                      <div
                        className={`text-xs font-mono ${t.change24h >= 0 ? "text-emerald-200" : "text-rose-200"}`}
                      >
                        {t.change24h >= 0 ? "+" : ""}
                        {t.change24h.toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-white/60 mt-1.5">
                        {t.marketCap > 0 ? `$${formatCompact(t.marketCap)}` : "—"}
                      </div>
                    </div>
                  );
                })}
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3x3 } from "lucide-react";
import { STATIC_TOKENS } from "@/lib/tokens";
import { formatNumber } from "@/lib/utils";

export default function HeatmapPage() {
  const section = SECTIONS.find((s) => s.href === "/analytics")!;
  const data = useMemo(
    () =>
      STATIC_TOKENS.map((t) => ({
        symbol: t.symbol,
        change: (Math.random() - 0.45) * 24,
        cap: 100_000_000 * (Math.random() * 8 + 0.2),
      })).sort((a, b) => b.cap - a.cap),
    []
  );

  return (
    <SectionShell
      title="Solana Ecosystem Heatmap"
      description="Visual grid of recent performance, sized by market cap and colored by 24h change."
      badge="24h"
      baseHref="/analytics"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="size-4 text-primary" />
            Heatmap
          </CardTitle>
          <CardDescription>Hover for details. Greens = up, reds = down.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {data.map((t) => {
              const intensity = Math.min(0.85, Math.abs(t.change) / 20);
              const color = t.change >= 0
                ? `rgba(56, 248, 173, ${intensity})`
                : `rgba(248, 113, 113, ${intensity})`;
              const ring =
                t.change >= 5
                  ? "ring-emerald-400/40"
                  : t.change <= -5
                    ? "ring-rose-400/40"
                    : "ring-white/5";
              return (
                <div
                  key={t.symbol}
                  className={`group rounded-xl border border-white/[0.06] p-3 transition-all hover:scale-[1.02] cursor-pointer ring-1 ${ring}`}
                  style={{ background: `linear-gradient(180deg, ${color} 0%, rgba(10,12,18,0.4) 100%)` }}
                >
                  <div className="text-sm font-semibold">{t.symbol}</div>
                  <div
                    className={`text-xs font-mono ${t.change >= 0 ? "text-emerald-200" : "text-rose-200"}`}
                  >
                    {t.change >= 0 ? "+" : ""}
                    {t.change.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-white/60 mt-1.5">
                    ${formatNumber(t.cap)}
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

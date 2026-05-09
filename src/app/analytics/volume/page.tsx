"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { ChartBar } from "lucide-react";
import { STATIC_TOKENS } from "@/lib/tokens";
import {
  aggregateByDex,
  fetchAllPairsForMints,
  type DexAggregate,
} from "@/lib/market-data";
import { formatCompact } from "@/lib/utils";

const DEX_COLORS: Record<string, string> = {
  raydium: "hsl(var(--neon-mint))",
  orca: "hsl(var(--neon-blue))",
  phoenix: "hsl(var(--neon-purple))",
  meteora: "hsl(var(--neon-pink))",
  lifinity: "hsl(var(--neon-orange))",
  whirlpool: "hsl(var(--neon-blue))",
  solfi: "#f59e0b",
  fluxbeam: "#a855f7",
  pumpswap: "#f43f5e",
  unknown: "rgba(255,255,255,0.4)",
};

const REFRESH_MS = 60_000;

function colorFor(dexId: string): string {
  return DEX_COLORS[dexId.toLowerCase()] ?? "hsl(var(--neon-mint))";
}

export default function VolumePage() {
  const [agg, setAgg] = useState<DexAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      try {
        const pairs = await fetchAllPairsForMints(
          STATIC_TOKENS.map((t) => t.address),
          controller.signal,
        );
        if (cancelled) return;
        setAgg(aggregateByDex(pairs).slice(0, 10));
        setLastUpdated(Date.now());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(id);
    };
  }, []);

  const totalVolume = useMemo(
    () => agg.reduce((s, d) => s + d.volume24h, 0),
    [agg],
  );

  return (
    <SectionShell
      title="Volume Tracker"
      description="DEX-by-DEX 24h volume across the tracked Solana ecosystem."
      badge={loading ? "Loading" : "Live · 24h"}
      baseHref="/analytics"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="size-4 text-primary" /> DEX volume (24h)
            </CardTitle>
            <CardDescription>
              {lastUpdated
                ? `Aggregated across ${agg.reduce((s, d) => s + d.pairCount, 0)} pairs · refreshed ${new Date(lastUpdated).toLocaleTimeString()}`
                : "Loading aggregated DEX volume from DexScreener…"}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[420px] pl-1 pr-3 pb-3">
            {loading && agg.length === 0 ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agg} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
                  <XAxis
                    dataKey="dexId"
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }}
                  />
                  <YAxis
                    tickFormatter={(v: number) => `$${formatCompact(v)}`}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      background: "rgba(10,12,18,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      fontSize: 11,
                    }}
                    formatter={(v: unknown) => `$${formatCompact(Number(v) || 0)}`}
                    labelFormatter={(l: unknown) => `${String(l).toUpperCase()}`}
                  />
                  <Bar dataKey="volume24h" radius={[4, 4, 0, 0]}>
                    {agg.map((d) => (
                      <Cell key={d.dexId} fill={colorFor(d.dexId)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Routing share</CardTitle>
            <CardDescription>% of tracked 24h volume per DEX</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && agg.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              : agg.map((d) => {
                  const share = totalVolume > 0 ? (d.volume24h / totalVolume) * 100 : 0;
                  return (
                    <div key={d.dexId}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium capitalize">{d.dexId}</span>
                        <span className="font-mono text-muted-foreground">
                          {share.toFixed(1)}% · ${formatCompact(d.volume24h)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${share}%`, background: colorFor(d.dexId) }}
                        />
                      </div>
                      <div className="text-[10px] text-muted-foreground/70 mt-1">
                        {d.pairCount} pair{d.pairCount === 1 ? "" : "s"} · liq ${formatCompact(d.liquidity)}
                      </div>
                    </div>
                  );
                })}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

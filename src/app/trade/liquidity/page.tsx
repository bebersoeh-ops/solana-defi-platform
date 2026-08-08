"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Waves, Info } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  aggregateByDex,
  fetchAllPairsForMints,
  type DexAggregate,
} from "@/lib/market-data";
import { getQuote } from "@/lib/jupiter";
import { SOL_MINT, USDC_MINT } from "@/lib/constants";

interface DepthPoint {
  size: number;
  amountIn: number;
  outAmount: number;
  priceImpactPct: number;
  marginalPrice: number;
}

const SIZE_LADDER_SOL = [0.1, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];

const DEX_PALETTE = [
  "hsl(var(--neon-mint))",
  "hsl(var(--neon-blue))",
  "hsl(var(--neon-purple))",
  "hsl(var(--neon-pink))",
  "hsl(var(--neon-orange))",
  "rgba(255,255,255,0.32)",
];

export default function LiquidityVizPage() {
  const [agg, setAgg] = useState<DexAggregate[]>([]);
  const [aggError, setAggError] = useState<string | null>(null);
  const [aggLoading, setAggLoading] = useState(true);

  const [depth, setDepth] = useState<DepthPoint[]>([]);
  const [depthError, setDepthError] = useState<string | null>(null);
  const [depthLoading, setDepthLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;
    (async () => {
      setAggLoading(true);
      setAggError(null);
      try {
        const pairs = await fetchAllPairsForMints(
          [SOL_MINT, USDC_MINT],
          ctrl.signal,
        );
        if (cancelled) return;
        setAgg(aggregateByDex(pairs).slice(0, 8));
      } catch (e) {
        if (cancelled) return;
        setAggError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setAggLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDepthLoading(true);
      setDepthError(null);
      try {
        const SOL_DECIMALS = 9;
        const USDC_DECIMALS = 6;
        const results = await Promise.all(
          SIZE_LADDER_SOL.map(async (size) => {
            const lamports = Math.floor(size * Math.pow(10, SOL_DECIMALS));
            try {
              const quote = await getQuote({
                inputMint: SOL_MINT,
                outputMint: USDC_MINT,
                amount: lamports,
                slippageBps: 50,
              });
              const outAmount = Number(quote.outAmount) / Math.pow(10, USDC_DECIMALS);
              const impact = Number(quote.priceImpactPct ?? 0) * 100;
              const marginal = outAmount / size;
              return {
                size,
                amountIn: size,
                outAmount,
                priceImpactPct: impact,
                marginalPrice: marginal,
              };
            } catch {
              return null;
            }
          }),
        );
        if (cancelled) return;
        const ok = results.filter((r): r is DepthPoint => r !== null);
        setDepth(ok);
      } catch (e) {
        if (cancelled) return;
        setDepthError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setDepthLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalLiq = useMemo(() => agg.reduce((s, d) => s + d.liquidity, 0), [agg]);
  const dexShares = useMemo(
    () =>
      agg.map((d, i) => ({
        name: d.dexId,
        liquidityUsd: d.liquidity,
        volume24h: d.volume24h,
        share: totalLiq > 0 ? (d.liquidity / totalLiq) * 100 : 0,
        color: DEX_PALETTE[i % DEX_PALETTE.length],
      })),
    [agg, totalLiq],
  );

  const liveBadge =
    !aggLoading && !depthLoading && agg.length > 0 && depth.length > 0
      ? `Live · SOL/USDC · ${agg.length} DEXes`
      : "Loading…";

  return (
    <SectionShell
      title="Liquidity Visualizer"
      description="Real on-chain liquidity for SOL/USDC: depth via Jupiter route impact across order sizes, AMM mix from DexScreener pair aggregation."
      badge={liveBadge}
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waves className="size-4 text-primary" />
              Depth · SOL → USDC price impact
            </CardTitle>
            <CardDescription>
              Live Jupiter route impact at increasing SOL trade sizes. Bar
              height = % impact. Higher means thinner liquidity at that size.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-96 pl-1 pr-3 pb-3">
            {depthLoading ? (
              <Skeleton className="h-full w-full" />
            ) : depthError ? (
              <ErrorBanner message={depthError} />
            ) : depth.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depth} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="size"
                    tickFormatter={(v: number) => (v >= 1 ? `${v} SOL` : `${v}`)}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
                  />
                  <YAxis
                    tickFormatter={(v: number) => `${v.toFixed(2)}%`}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,12,18,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      fontSize: 11,
                    }}
                    formatter={(value, name, item) => {
                      if (name === "priceImpactPct") {
                        return [`${(value as number).toFixed(3)}%`, "Price impact"];
                      }
                      const p = item.payload as DepthPoint;
                      return [
                        `${p.outAmount.toFixed(2)} USDC @ $${p.marginalPrice.toFixed(2)}`,
                        "Receive",
                      ];
                    }}
                    labelFormatter={(v) => `Trade size: ${v} SOL`}
                  />
                  <Bar
                    dataKey="priceImpactPct"
                    radius={[4, 4, 0, 0]}
                    fill="hsl(var(--neon-mint))"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              AMM mix · SOL/USDC
            </CardTitle>
            <CardDescription>
              Share of TVL by DEX for the SOL ↔ USDC pair (DexScreener).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aggLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-7 w-full" />
                ))}
              </div>
            ) : aggError ? (
              <ErrorBanner message={aggError} />
            ) : dexShares.length === 0 ? (
              <Empty />
            ) : (
              <>
                {dexShares.map((d) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium capitalize">{d.name}</span>
                      <span className="text-muted-foreground font-mono">
                        ${(d.liquidityUsd / 1_000_000).toFixed(2)}M · {d.share.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: `${d.share}%`, background: d.color }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-[11px] text-muted-foreground rounded-lg border border-dashed border-white/10 px-3 py-2">
                  Aggregated from DexScreener pairs for SOL & USDC. Refresh on
                  reload.
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300 flex items-start gap-2 m-2">
      <Info className="size-3.5 mt-0.5 shrink-0" />
      <span className="break-all">{message}</span>
    </div>
  );
}

function Empty() {
  return (
    <div className="text-xs text-muted-foreground p-4">
      No data returned. Try again later.
    </div>
  );
}

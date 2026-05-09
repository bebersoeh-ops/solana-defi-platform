"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ChartLine } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getMockPortfolioAssets } from "@/lib/mock-data";
import { useWalletTokens } from "@/hooks/use-wallet-tokens";
import {
  fetchSolanaPriceChart,
  type MarketChartPoint,
} from "@/lib/market-data";
import { formatUsd } from "@/lib/utils";
import { TokenIcon } from "@/components/shared/token-icon";

export default function PnlPage() {
  const wallet = useWalletTokens();
  const assets = useMemo(
    () =>
      wallet.isConnected && wallet.assets.length > 0
        ? wallet.assets
        : getMockPortfolioAssets(),
    [wallet.isConnected, wallet.assets],
  );
  const totalValue = useMemo(
    () => assets.reduce((s, a) => s + a.value, 0),
    [assets],
  );
  const totalPnl24h = useMemo(
    () => assets.reduce((s, a) => s + a.value * (a.change24h / 100), 0),
    [assets],
  );
  const pct24h = totalValue > 0 ? (totalPnl24h / totalValue) * 100 : 0;

  const [chart, setChart] = useState<MarketChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      try {
        const points = await fetchSolanaPriceChart(controller.signal);
        if (cancelled) return;
        setChart(points);
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    }
    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(id);
    };
  }, []);

  const sorted = useMemo(
    () =>
      [...assets].sort(
        (a, b) =>
          Math.abs(b.value * (b.change24h / 100)) -
          Math.abs(a.value * (a.change24h / 100)),
      ),
    [assets],
  );

  return (
    <SectionShell
      title="PnL Tracker"
      description="24h portfolio profit & loss derived from live token prices."
      badge={wallet.isConnected ? "Live · 24h" : "Demo · 24h"}
      baseHref="/portfolio"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ChartLine className="size-4 text-primary" /> 24h PnL
                </CardTitle>
                <CardDescription>
                  {wallet.isConnected
                    ? "Computed from your live SPL holdings × 24h price change"
                    : "Demo holdings — connect a wallet to see your real 24h PnL"}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">24h change</div>
                <div
                  className={`text-2xl font-semibold ${totalPnl24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {totalPnl24h >= 0 ? "+" : ""}
                  {formatUsd(totalPnl24h)}
                </div>
                <div
                  className={`text-xs font-mono ${pct24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {pct24h >= 0 ? "+" : ""}
                  {pct24h.toFixed(2)}%
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[360px] pl-1 pr-3 pb-3">
            {chartLoading && chart.length === 0 ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={totalPnl24h >= 0 ? "hsl(var(--neon-mint))" : "#f87171"}
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="100%"
                        stopColor={totalPnl24h >= 0 ? "hsl(var(--neon-mint))" : "#f87171"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="t"
                    tickFormatter={(v: number) =>
                      new Date(v).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,12,18,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      fontSize: 11,
                    }}
                    formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, "SOL"]}
                    labelFormatter={(label: unknown) =>
                      new Date(Number(label)).toLocaleString()
                    }
                  />
                  <Area
                    dataKey="v"
                    stroke={totalPnl24h >= 0 ? "hsl(var(--neon-mint))" : "#f87171"}
                    strokeWidth={2}
                    fill="url(#pnlFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> Per-asset PnL
            </CardTitle>
            <CardDescription>
              {wallet.isConnected ? "Live · top movers by 24h $ change" : "Demo · top movers by 24h $ change"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {wallet.isLoading && wallet.isConnected && wallet.assets.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))
              : sorted.slice(0, 8).map((a) => {
                  const pnl = a.value * (a.change24h / 100);
                  return (
                    <div
                      key={a.address}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <TokenIcon src={a.logoURI} symbol={a.symbol} size={20} />
                        <div className="text-xs font-medium truncate">{a.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs font-mono ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {pnl >= 0 ? "+" : ""}
                          {formatUsd(pnl)}
                        </div>
                        <div
                          className={`text-[10px] font-mono ${a.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {a.change24h >= 0 ? "+" : ""}
                          {a.change24h.toFixed(2)}%
                        </div>
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

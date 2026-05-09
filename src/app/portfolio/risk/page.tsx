"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle, ChartBar } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { getMockPortfolioAssets } from "@/lib/mock-data";
import { useWalletTokens } from "@/hooks/use-wallet-tokens";
import { formatUsd } from "@/lib/utils";

export default function RiskPage() {
  const wallet = useWalletTokens();
  const assets = useMemo(
    () =>
      wallet.isConnected && wallet.assets.length > 0
        ? wallet.assets
        : getMockPortfolioAssets(),
    [wallet.isConnected, wallet.assets],
  );
  const total = assets.reduce((s, a) => s + a.value, 0);
  const sorted = useMemo(
    () => [...assets].sort((a, b) => b.allocation - a.allocation),
    [assets],
  );
  const top1 = sorted[0]?.allocation ?? 0;
  const top3 = sorted.slice(0, 3).reduce((s, a) => s + a.allocation, 0);
  const stables = assets
    .filter((a) => a.symbol === "USDC" || a.symbol === "USDT")
    .reduce((s, a) => s + a.allocation, 0);
  const volatility = assets.reduce(
    (s, a) => s + Math.abs(a.change24h) * (a.allocation / 100),
    0
  );

  return (
    <SectionShell
      title="Risk Monitor"
      description="Concentration, volatility, and drawdown signals across your portfolio."
      badge={wallet.isConnected ? "Live" : "Demo"}
      baseHref="/portfolio"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-300" /> Risk score
            </CardTitle>
            <CardDescription>Composite of concentration & volatility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreBar label="Top-1 concentration" value={top1} max={100} suffix="%" tone={top1 > 50 ? "rose" : "amber"} />
            <ScoreBar label="Top-3 concentration" value={top3} max={100} suffix="%" tone={top3 > 75 ? "amber" : "emerald"} />
            <ScoreBar label="Stablecoin buffer" value={stables} max={100} suffix="%" tone={stables < 10 ? "rose" : "emerald"} />
            <ScoreBar label="24h volatility" value={volatility} max={20} suffix="%" tone={volatility > 8 ? "rose" : "amber"} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="size-4 text-primary" /> Per-asset volatility contribution
            </CardTitle>
            <CardDescription>How much each asset moves your portfolio (24h)</CardDescription>
          </CardHeader>
          <CardContent className="h-[360px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={assets.map((a) => ({
                  symbol: a.symbol,
                  contribution: Math.abs(a.change24h) * (a.allocation / 100),
                }))}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis dataKey="symbol" type="category" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} width={60} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="contribution" fill="hsl(var(--neon-pink))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-rose-400" />
            Active risk signals
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Signal
            tone="rose"
            title={`${assets[0]?.symbol} concentration high`}
            body={`Position represents ${top1.toFixed(1)}% of total ${formatUsd(total)} portfolio.`}
          />
          <Signal
            tone="amber"
            title="Stablecoin buffer thin"
            body={`Stables make up ${stables.toFixed(1)}% — consider rebalancing for volatility shocks.`}
          />
          <Signal tone="emerald" title="No flagged tokens" body="None of your holdings appear on the rug-risk watchlist." />
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function ScoreBar({
  label,
  value,
  max,
  suffix,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  tone: "rose" | "amber" | "emerald";
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colors = {
    rose: "bg-rose-400",
    amber: "bg-amber-400",
    emerald: "bg-emerald-400",
  } as const;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span>{label}</span>
        <span className="font-mono text-muted-foreground">
          {value.toFixed(1)}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div className={`h-full ${colors[tone]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Signal({
  tone,
  title,
  body,
}: {
  tone: "rose" | "amber" | "emerald";
  title: string;
  body: string;
}) {
  const c = {
    rose: "border-rose-500/30 bg-rose-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    emerald: "border-emerald-500/30 bg-emerald-500/5",
  } as const;
  return (
    <div className={`rounded-lg border ${c[tone]} px-3 py-2.5`}>
      <div className="text-xs font-medium">{title}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{body}</div>
    </div>
  );
}

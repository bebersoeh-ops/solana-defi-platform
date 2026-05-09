"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ChartLine } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getMockPnlSeries, getMockPortfolioAssets } from "@/lib/mock-data";
import { formatUsd } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RANGES = [
  { id: "7d", days: 7, label: "7d" },
  { id: "30d", days: 30, label: "30d" },
  { id: "90d", days: 90, label: "90d" },
  { id: "all", days: 365, label: "All" },
];

export default function PnlPage() {
  const section = SECTIONS.find((s) => s.href === "/portfolio")!;
  const [range, setRange] = useState("30d");
  const days = RANGES.find((r) => r.id === range)?.days ?? 30;
  const series = useMemo(() => getMockPnlSeries(days), [days]);
  const assets = useMemo(() => getMockPortfolioAssets(), []);

  const startVal = series[0].value;
  const endVal = series[series.length - 1].value;
  const change = endVal - startVal;
  const pct = (change / startVal) * 100;

  return (
    <SectionShell
      title="PnL Tracker"
      description="Profit and loss across the selected time range. Token-level breakdown included."
      badge={range.toUpperCase()}
      baseHref="/portfolio"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ChartLine className="size-4 text-primary" />
                  Net worth · {range}
                </CardTitle>
                <CardDescription>{formatUsd(endVal)} now · {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</CardDescription>
              </div>
              <Tabs value={range} onValueChange={setRange}>
                <TabsList>
                  {RANGES.map((r) => (
                    <TabsTrigger key={r.id} value={r.id} className="text-xs">
                      {r.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="h-[420px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--neon-mint))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--neon-mint))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" tickFormatter={(v: number) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                  formatter={(v: unknown) => [formatUsd(Number(v) || 0), "Value"]}
                  labelFormatter={(label: unknown) => new Date(Number(label)).toLocaleDateString()}
                />
                <Area dataKey="value" stroke="hsl(var(--neon-mint))" strokeWidth={2} fill="url(#pnlFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Per-asset PnL
            </CardTitle>
            <CardDescription>Mock data · top 7 holdings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {assets.slice(0, 7).map((a) => {
              const pnl = a.value * (a.change24h / 100);
              return (
                <div key={a.address} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-medium">{a.symbol}</div>
                  </div>
                  <div
                    className={`text-xs font-mono ${a.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {pnl >= 0 ? "+" : ""}
                    {formatUsd(pnl)}
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

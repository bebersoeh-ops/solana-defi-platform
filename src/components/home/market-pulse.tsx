"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function generateSeries(): Array<{ t: string; v: number }> {
  const points: Array<{ t: string; v: number }> = [];
  const now = Date.now();
  let v = 100;
  for (let i = 144; i >= 0; i--) {
    const seed = Math.sin(i * 0.21) * 0.03 + (Math.random() - 0.5) * 0.02;
    v = v * (1 + seed);
    points.push({
      t: new Date(now - i * 600_000).toISOString(),
      v: Math.max(50, v),
    });
  }
  return points;
}

export function MarketPulse() {
  const data = useMemo(() => generateSeries(), []);
  const last = data[data.length - 1].v;
  const first = data[0].v;
  const change = ((last - first) / first) * 100;

  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Market pulse</CardTitle>
            <Badge variant="live" className="text-[9px]">LIVE</Badge>
          </div>
          <CardDescription>
            Aggregated Solana liquidity index · 24h
          </CardDescription>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tracking-tight">
            {last.toFixed(2)}
            <span className="text-sm text-muted-foreground ml-1">SLI</span>
          </div>
          <div
            className={`text-xs font-mono ${change >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-1 pt-1 pb-2">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pulseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--neon-mint))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--neon-mint))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis hide dataKey="t" />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,12,18,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  fontSize: 11,
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(v: unknown) => [(Number(v) ?? 0).toFixed(2), "SLI"]}
                labelFormatter={(label: unknown) => new Date(String(label)).toLocaleTimeString()}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="hsl(var(--neon-mint))"
                strokeWidth={2}
                fill="url(#pulseFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-3 px-4 pt-3 pb-3 text-xs">
          <Stat label="DEX volume" value="$612M" change={4.1} />
          <Stat label="Active pools" value="1,842" change={1.2} />
          <Stat label="Avg slippage" value="0.42%" change={-0.05} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: number;
}) {
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 font-medium">{value}</div>
      <div
        className={`text-[10px] font-mono ${change >= 0 ? "text-emerald-400" : "text-rose-400"}`}
      >
        {change >= 0 ? "+" : ""}
        {change}%
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { UTILITY_SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function RoutingHealthPage() {
  const section = UTILITY_SECTIONS.find((s) => s.href === "/dashboard")!;
  const data = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        t: i,
        latency: 80 + Math.random() * 60,
        success: 95 + Math.random() * 5,
      })),
    []
  );
  const dexes = useMemo(
    () => [
      { name: "Raydium CPMM", latency: 88, fail: 0.32, share: 31 },
      { name: "Orca Whirlpool", latency: 96, fail: 0.18, share: 24 },
      { name: "Phoenix", latency: 64, fail: 0.51, share: 19 },
      { name: "Meteora DLMM", latency: 102, fail: 0.42, share: 14 },
      { name: "Lifinity v2", latency: 152, fail: 0.78, share: 7 },
      { name: "Cykura", latency: 184, fail: 1.24, share: 5 },
    ],
    []
  );

  return (
    <SectionShell
      title="Routing Health"
      description="Per-DEX latency and failure rate across the last hour."
      badge="60m"
      baseHref="/dashboard"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-primary" /> Aggregator latency
            </CardTitle>
            <CardDescription>Average end-to-end quote latency</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="rtFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--neon-purple))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--neon-purple))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                />
                <Area dataKey="latency" stroke="hsl(var(--neon-purple))" strokeWidth={2} fill="url(#rtFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-4 text-primary" /> DEX scoreboard
            </CardTitle>
            <CardDescription>Sorted by routing share</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dexes.map((d) => (
              <div
                key={d.name}
                className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground">{d.share}%</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {d.latency}ms · {d.fail.toFixed(2)}% fail
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

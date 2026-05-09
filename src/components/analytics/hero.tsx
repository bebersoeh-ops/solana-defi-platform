"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ChartLine, Coins, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { formatNumber } from "@/lib/utils";

export function AnalyticsHero() {
  const data = useMemo(() => {
    const out: Array<{ t: number; volume: number; tx: number }> = [];
    let v = 100_000_000;
    for (let i = 0; i < 48; i++) {
      v *= 1 + (Math.random() - 0.5) * 0.05;
      out.push({ t: i, volume: v, tx: Math.floor(28000 + Math.random() * 6000) });
    }
    return out;
  }, []);
  const last = data[data.length - 1];
  const first = data[0];
  const change = ((last.volume - first.volume) / first.volume) * 100;

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-fuchsia-500/10 blur-[100px] pointer-events-none" />
      <CardContent className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-5 gap-5 relative">
        <div className="lg:col-span-2 space-y-2">
          <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
            <Activity className="size-3.5" /> Solana DEX activity · 24h
          </div>
          <div className="text-3xl md:text-4xl font-semibold">
            ${formatNumber(last.volume)}
          </div>
          <div
            className={`text-sm font-medium ${change >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}% vs 24h ago
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3">
            <Mini icon={<Zap className="size-3.5" />} label="TPS" value="3,219" />
            <Mini icon={<Coins className="size-3.5" />} label="DEXes" value="38" />
            <Mini icon={<ChartLine className="size-3.5" />} label="Pairs" value="12.4k" />
          </div>
        </div>
        <div className="lg:col-span-3 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="dexFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--neon-purple))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--neon-purple))" stopOpacity={0} />
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
              />
              <Area
                dataKey="volume"
                stroke="hsl(var(--neon-purple))"
                strokeWidth={2}
                fill="url(#dexFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function Mini({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 inline-flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartBar } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function VolumePage() {
  const section = SECTIONS.find((s) => s.href === "/analytics")!;
  const data = useMemo(() => {
    const days = 14;
    const out: Array<Record<string, string | number>> = [];
    for (let i = 0; i < days; i++) {
      out.push({
        d: new Date(Date.now() - (days - i) * 86_400_000).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        Raydium: 200_000_000 + Math.random() * 80_000_000,
        Orca: 120_000_000 + Math.random() * 60_000_000,
        Phoenix: 80_000_000 + Math.random() * 40_000_000,
        Meteora: 60_000_000 + Math.random() * 30_000_000,
        Lifinity: 40_000_000 + Math.random() * 20_000_000,
      });
    }
    return out;
  }, []);

  const dexes = useMemo(
    () => [
      { name: "Raydium", color: "hsl(var(--neon-mint))", share: 32 },
      { name: "Orca", color: "hsl(var(--neon-blue))", share: 24 },
      { name: "Phoenix", color: "hsl(var(--neon-purple))", share: 18 },
      { name: "Meteora", color: "hsl(var(--neon-pink))", share: 14 },
      { name: "Lifinity", color: "hsl(var(--neon-orange))", share: 8 },
    ],
    []
  );

  return (
    <SectionShell
      title="Volume Tracker"
      description="DEX-by-DEX volume and routing concentration."
      badge="14d"
      baseHref="/analytics"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="size-4 text-primary" /> DEX volume (stacked)
            </CardTitle>
            <CardDescription>Daily volume in USD across major Solana DEXes</CardDescription>
          </CardHeader>
          <CardContent className="h-[420px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="d" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis tickFormatter={(v: number) => `$${formatNumber(v)}`} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                  formatter={(v: unknown) => `$${formatNumber(Number(v) || 0)}`}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {dexes.map((d) => (
                  <Bar key={d.name} dataKey={d.name} stackId="a" fill={d.color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Routing share</CardTitle>
            <CardDescription>% of trades passing through each DEX</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dexes.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{d.name}</span>
                  <span className="font-mono text-muted-foreground">{d.share}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: `${d.share * 2.5}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

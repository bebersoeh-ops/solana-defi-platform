"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Waves } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

export default function LiquidityVizPage() {
  const section = SECTIONS.find((s) => s.href === "/trade")!;
  const data = useMemo(() => {
    const out: Array<{ p: string; l: number; bin: number }> = [];
    for (let i = -25; i <= 25; i++) {
      const x = 180 + i * 0.5;
      const center = Math.exp(-(i * i) / 80) * 1500;
      const noise = Math.random() * 200;
      out.push({ p: x.toFixed(2), l: Math.max(50, center + noise), bin: i });
    }
    return out;
  }, []);

  const dexes = useMemo(
    () => [
      { name: "Raydium CLMM", share: 32, color: "hsl(var(--neon-mint))" },
      { name: "Orca Whirlpool", share: 24, color: "hsl(var(--neon-blue))" },
      { name: "Phoenix v2", share: 18, color: "hsl(var(--neon-purple))" },
      { name: "Meteora DLMM", share: 14, color: "hsl(var(--neon-pink))" },
      { name: "Lifinity v2", share: 8, color: "hsl(var(--neon-orange))" },
      { name: "Other", share: 4, color: "rgba(255,255,255,0.2)" },
    ],
    []
  );

  return (
    <SectionShell
      title="Liquidity Visualizer"
      description="Visualize concentrated liquidity across price ranges and the AMM mix routing your trade."
      badge="Demo · SOL/USDC"
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waves className="size-4 text-primary" />
              Liquidity by price (SOL/USDC)
            </CardTitle>
            <CardDescription>Concentrated liquidity bins · simulated</CardDescription>
          </CardHeader>
          <CardContent className="h-[420px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="p" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="l" radius={[3, 3, 0, 0]}>
                  {data.map((d) => (
                    <Cell
                      key={d.p}
                      fill={d.bin === 0 ? "hsl(var(--neon-mint))" : "rgba(126,238,179,0.45)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              AMM mix
            </CardTitle>
            <CardDescription>Share of liquidity by DEX</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dexes.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground font-mono">{d.share}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full" style={{ width: `${d.share}%`, background: d.color }} />
                </div>
              </div>
            ))}
            <div className="pt-2 text-[11px] text-muted-foreground rounded-lg border border-dashed border-white/10 px-3 py-2">
              Distribution refreshes every 30s based on Jupiter's quoter. Demo
              data shown when offline.
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

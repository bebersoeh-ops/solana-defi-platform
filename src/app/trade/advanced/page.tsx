import type { Metadata } from "next";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { SwapCard } from "@/components/swap/swap-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Zap, ChartLine, Cpu, Layers } from "lucide-react";

export const metadata: Metadata = { title: "Advanced Swap" };

export default function AdvancedSwapPage() {
  const section = SECTIONS.find((s) => s.href === "/trade")!;
  return (
    <SectionShell
      title="Advanced Swap"
      description="Pro-grade execution: multi-route comparison, MEV simulation, gas tuning, and route latency telemetry. Swap is live; side panels are demo telemetry."
      badge="Pro · demo telemetry"
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <SwapCard />
        </div>
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Multi-route comparison
              </CardTitle>
              <CardDescription>Compare top 3 candidate routes by output, latency, and impact.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Best output", out: "+0.07%", impact: "0.12%", latency: "182ms", winner: true },
                { name: "Lowest impact", out: "-0.04%", impact: "0.04%", latency: "210ms" },
                { name: "Fastest", out: "-0.10%", impact: "0.21%", latency: "94ms" },
              ].map((r) => (
                <div
                  key={r.name}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-medium flex items-center gap-2">
                      {r.name}
                      {r.winner ? <Badge variant="success" className="text-[9px]">SELECTED</Badge> : null}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Impact {r.impact} · Latency {r.latency}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-emerald-400">{r.out}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-amber-300" />
                MEV risk simulation
              </CardTitle>
              <CardDescription>Estimated worst-case sandwich loss based on liquidity & order size.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Stat label="Sandwich risk" value="Low" tone="emerald" />
              <Stat label="Frontrun probability" value="3.4%" tone="emerald" />
              <Stat label="Worst-case loss" value="0.12%" tone="amber" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                Gas / priority estimator
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              {[
                { l: "Base", v: "5,000 lamports" },
                { l: "Priority", v: "120k lamports" },
                { l: "Network", v: "Healthy" },
              ].map((g) => (
                <div key={g.l} className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-2 py-2 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{g.l}</div>
                  <div className="text-xs mt-1">{g.v}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="size-4 text-fuchsia-300" />
                Route telemetry
              </CardTitle>
              <CardDescription>p50 / p95 latency per AMM in route plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { dex: "Raydium CLMM", p50: 86, p95: 142 },
                { dex: "Phoenix v2", p50: 74, p95: 121 },
                { dex: "Meteora", p50: 92, p95: 161 },
              ].map((r) => (
                <div key={r.dex} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span>{r.dex}</span>
                    <span className="font-mono text-muted-foreground">
                      p50 {r.p50}ms · p95 {r.p95}ms
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${Math.min(100, r.p95 / 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "emerald" | "amber" | "rose" }) {
  const colors = {
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    rose: "text-rose-400 border-rose-500/20 bg-rose-500/5",
  } as const;
  return (
    <div className={`rounded-lg border ${colors[tone]} px-3 py-2 flex items-center justify-between`}>
      <span className="text-xs">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

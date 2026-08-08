"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Receipt, Zap, ChartBar } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function FeeEstimatorPage() {
  const section = SECTIONS.find((s) => s.href === "/trade")!;
  const [priority, setPriority] = useState(120_000);
  const [orderSize, setOrderSize] = useState(500);

  const data = useMemo(() => {
    const points: Array<{ block: number; lamports: number }> = [];
    let v = 80_000;
    for (let i = 0; i < 60; i++) {
      v = Math.max(10_000, v * (1 + (Math.random() - 0.5) * 0.1));
      points.push({ block: i, lamports: Math.floor(v) });
    }
    return points;
  }, []);

  const lamportsToSol = (l: number) => l / 1e9;
  const solUsd = 180;
  const baseFee = 5000;
  const totalFee = baseFee + priority;
  const totalSol = lamportsToSol(totalFee);
  const totalUsd = totalSol * solUsd;

  return (
    <SectionShell
      title="Fee Estimator"
      description="Estimate transaction fees, priority fees, and inclusion probability. Network priority and inclusion charts are demo data."
      badge="Demo · lamports"
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              Estimator
            </CardTitle>
            <CardDescription>Tune inputs to see realtime fee math.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label={`Order size · $${orderSize}`}>
              <Slider value={orderSize} onValueChange={setOrderSize} min={50} max={50000} step={50} />
            </Field>
            <Field label={`Priority fee · ${priority.toLocaleString()} lamports`}>
              <Slider value={priority} onValueChange={setPriority} min={0} max={500_000} step={1000} />
            </Field>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
              <Row label="Base fee" value={`${baseFee.toLocaleString()} lamports`} />
              <Row label="Priority fee" value={`${priority.toLocaleString()} lamports`} />
              <Row label="Total" value={`${totalFee.toLocaleString()} lamports`} />
              <Row label="Cost in SOL" value={totalSol.toFixed(8)} />
              <Row label="USD equivalent" value={`$${totalUsd.toFixed(4)}`} />
              <Row label="% of order" value={`${((totalUsd / orderSize) * 100).toFixed(4)}%`} />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="size-4 text-primary" />
              Network priority p95 (last 60 blocks)
            </CardTitle>
            <CardDescription>Higher line = more competition.</CardDescription>
          </CardHeader>
          <CardContent className="h-[360px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="feeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--neon-purple))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--neon-purple))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="block" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                />
                <Area
                  dataKey="lamports"
                  stroke="hsl(var(--neon-purple))"
                  strokeWidth={2}
                  fill="url(#feeFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-4 text-primary" /> Inclusion probability heuristic
          </CardTitle>
          <CardDescription>
            Higher priority fee = better chance of landing in the next block.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { p: "0–25k", chance: 22 },
            { p: "25k–100k", chance: 58 },
            { p: "100k–250k", chance: 86 },
            { p: "250k+", chance: 96 },
          ].map((r) => (
            <div key={r.p} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
              <div className="text-xs text-muted-foreground">{r.p} lamports</div>
              <div className="mt-2 text-xl font-semibold">{r.chance}%</div>
              <div className="mt-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${r.chance}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground/70 mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Sparkles, ChartLine, Calendar } from "lucide-react";

export default function DcaPage() {
  const section = SECTIONS.find((s) => s.href === "/trade")!;
  const [amount, setAmount] = useState("100");
  const [days, setDays] = useState(30);
  const [vol, setVol] = useState(35);
  const data = useMemo(() => {
    const out: Array<{ d: number; price: number; cost: number; bag: number }> = [];
    let bag = 0;
    let cost = 0;
    let p = 100;
    for (let i = 0; i <= days; i++) {
      const drift = Math.sin(i * 0.4) * (vol / 200);
      p = p * (1 + drift + (Math.random() - 0.5) * (vol / 800));
      const buy = Number(amount) || 0;
      bag += buy / p;
      cost += buy;
      out.push({ d: i, price: p, cost, bag });
    }
    return out;
  }, [amount, days, vol]);
  const final = data[data.length - 1];
  const value = final.bag * final.price;
  const pnl = value - final.cost;
  const pnlPct = (pnl / final.cost) * 100;

  return (
    <SectionShell
      title="DCA Simulator"
      description="Plan a dollar-cost-average strategy and project outcomes against simulated market conditions."
      badge="Demo · simulation"
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Strategy
            </CardTitle>
            <CardDescription>All inputs are simulated. No funds are moved.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="USDC per buy">
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
            </Field>
            <Field label={`Duration · ${days} days`}>
              <Slider value={days} onValueChange={setDays} min={7} max={180} />
            </Field>
            <Field label={`Market volatility · ${vol}%`}>
              <Slider value={vol} onValueChange={setVol} min={5} max={120} />
            </Field>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Stat label="Total cost" value={`$${final.cost.toFixed(0)}`} />
              <Stat label="Bag value" value={`$${value.toFixed(0)}`} />
              <Stat label="Tokens accumulated" value={final.bag.toFixed(4)} />
              <Stat
                label="Simulated PnL"
                value={`${pnl >= 0 ? "+" : ""}${pnl.toFixed(0)} (${pnlPct.toFixed(1)}%)`}
                tone={pnl >= 0 ? "emerald" : "rose"}
              />
            </div>
            <Button variant="gradient" className="w-full">
              <Calendar className="size-4" />
              Save strategy
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine className="size-4 text-primary" />
              Cost basis vs. value
            </CardTitle>
            <CardDescription>Simulated cumulative cost vs. mark-to-market value</CardDescription>
          </CardHeader>
          <CardContent className="h-[420px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                />
                <Line type="monotone" dataKey="cost" stroke="hsl(var(--neon-purple))" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="bag" stroke="hsl(var(--neon-mint))" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "emerald" | "rose";
}) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</div>
      <div
        className={`text-sm mt-1 font-medium ${tone === "emerald" ? "text-emerald-400" : tone === "rose" ? "text-rose-400" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

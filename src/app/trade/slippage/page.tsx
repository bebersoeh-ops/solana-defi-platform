"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Gauge, ShieldAlert } from "lucide-react";
import { useSwapStore } from "@/store/swap-store";
import { useMounted } from "@/hooks/use-mounted";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function SlippagePage() {
  const section = SECTIONS.find((s) => s.href === "/trade")!;
  const slippage = useSwapStore((s) => s.slippageBps);
  const setSlippage = useSwapStore((s) => s.setSlippageBps);
  const [autoMode, setAutoMode] = useState(true);
  const [maxSlippage, setMaxSlippage] = useState(300);

  const mounted = useMounted();

  const data = useMemo(() => {
    const out: Array<{ size: number; impact: number }> = [];
    for (let i = 0; i <= 50; i++) {
      const size = i * 200;
      const impact = Math.pow(size / 10_000, 1.45) * 100;
      out.push({ size, impact: Math.min(8, impact) });
    }
    return out;
  }, []);

  return (
    <SectionShell
      title="Slippage Manager"
      description="Tune your slippage policy per pair, network condition and order size."
      badge="Adaptive"
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="size-4 text-primary" />
              Defaults
            </CardTitle>
            <CardDescription>Stored locally and applied to every swap.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label={`Default slippage · ${(slippage / 100).toFixed(2)}%`}>
              <Slider value={mounted ? slippage : 50} onValueChange={setSlippage} min={1} max={1000} />
              <div className="grid grid-cols-4 gap-1.5 mt-2 text-xs">
                {[10, 50, 100, 300].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSlippage(v)}
                    className={`rounded-md border px-2 py-1 ${
                      slippage === v
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/[0.06]"
                    }`}
                  >
                    {(v / 100).toFixed(2)}%
                  </button>
                ))}
              </div>
            </Field>
            <Field label={`Hard cap · ${(maxSlippage / 100).toFixed(2)}%`}>
              <Slider value={maxSlippage} onValueChange={setMaxSlippage} min={50} max={2000} />
            </Field>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium">Adaptive auto-slippage</div>
                <div className="text-[10px] text-muted-foreground">Boost slippage during volatile blocks</div>
              </div>
              <Switch checked={autoMode} onCheckedChange={setAutoMode} />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-300" />
              Price impact vs. order size
            </CardTitle>
            <CardDescription>Estimated impact at current SOL/USDC depth · simulated</CardDescription>
          </CardHeader>
          <CardContent className="h-[360px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="impactFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--neon-pink))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--neon-pink))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="size" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                />
                <Area dataKey="impact" stroke="hsl(var(--neon-pink))" strokeWidth={2} fill="url(#impactFill)" />
              </AreaChart>
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

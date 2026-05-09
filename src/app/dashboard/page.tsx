"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { UTILITY_SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, Users, ChartLine, Server } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const section = UTILITY_SECTIONS.find((s) => s.href === "/dashboard")!;
  const series = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        t: i,
        users: 2200 + Math.floor(Math.random() * 600),
        latency: 80 + Math.floor(Math.random() * 60),
      })),
    []
  );

  return (
    <SectionShell
      title="Internal Dashboard"
      description={section.description}
      badge="Live"
      baseHref="/dashboard"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={<Users className="size-4" />} label="Active users" value={formatNumber(2641)} delta="+8.2%" tone="emerald" />
        <Stat icon={<Activity className="size-4" />} label="Quotes / 1h" value={formatNumber(184323)} delta="+2.1%" tone="emerald" />
        <Stat icon={<Zap className="size-4" />} label="Avg latency" value="124ms" delta="-6ms" tone="emerald" />
        <Stat icon={<ChartLine className="size-4" />} label="Fail rate" value="0.41%" delta="-0.07%" tone="amber" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-primary" /> Concurrent users (60m)
            </CardTitle>
            <CardDescription>Sliding window of active sessions</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--neon-mint))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--neon-mint))" stopOpacity={0} />
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
                <Area dataKey="users" stroke="hsl(var(--neon-mint))" strokeWidth={2} fill="url(#usersFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="size-4 text-primary" /> Service health
            </CardTitle>
            <CardDescription>Subsystem latency / uptime</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { name: "Quote API", uptime: "99.98%", latency: "112ms", tone: "emerald" as const },
              { name: "Swap builder", uptime: "99.92%", latency: "188ms", tone: "emerald" as const },
              { name: "Indexer (Helius)", uptime: "99.75%", latency: "243ms", tone: "amber" as const },
              { name: "WebSocket relay", uptime: "99.99%", latency: "62ms", tone: "emerald" as const },
            ].map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${s.tone === "emerald" ? "bg-emerald-400" : "bg-amber-400"}`}
                  />
                  <span className="text-xs">{s.name}</span>
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  {s.uptime} · {s.latency}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function Stat({
  icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  tone: "emerald" | "amber" | "rose";
}) {
  const tones = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  } as const;
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
      <div className={`text-[10px] mt-1 ${tones[tone]}`}>{delta} vs 24h</div>
    </div>
  );
}

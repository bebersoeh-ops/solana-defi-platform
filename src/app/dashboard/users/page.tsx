"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { UTILITY_SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { formatNumber, shortenAddress } from "@/lib/utils";

export default function UsersDashboardPage() {
  const section = UTILITY_SECTIONS.find((s) => s.href === "/dashboard")!;
  const cohort = useMemo(
    () =>
      [
        "Day 0",
        "Day 1",
        "Day 3",
        "Day 7",
        "Day 14",
        "Day 30",
      ].map((d, i) => ({
        day: d,
        retained: Math.floor(100 * Math.exp(-i * 0.32)),
      })),
    []
  );
  const top = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        wallet: `Use${"a1b2c3".repeat(2)}${i}`,
        swaps: Math.floor(40 + Math.random() * 200),
        volume: Math.floor(20_000 + Math.random() * 800_000),
      })),
    []
  );
  return (
    <SectionShell
      title="User Activity"
      description="Cohort retention and top users."
      badge="30d"
      baseHref="/dashboard"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-primary" /> Retention cohort
            </CardTitle>
            <CardDescription>% of day-0 users still active on each day</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohort}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="retained" fill="hsl(var(--neon-blue))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> Top regions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { name: "South-East Asia", pct: 31 },
              { name: "North America", pct: 24 },
              { name: "Europe", pct: 18 },
              { name: "LATAM", pct: 12 },
              { name: "Other", pct: 15 },
            ].map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{r.name}</span>
                  <span className="font-mono text-muted-foreground">{r.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${r.pct * 2.5}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Top users</CardTitle>
          <CardDescription>Sorted by 30d swap count</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <tr>
                  <th className="text-left px-5 py-2">#</th>
                  <th className="text-left px-2 py-2">Wallet</th>
                  <th className="text-right px-2 py-2">Swaps</th>
                  <th className="text-right px-5 py-2">Volume</th>
                </tr>
              </thead>
              <tbody>
                {top.map((u, i) => (
                  <tr key={u.wallet} className="border-b border-white/[0.03]">
                    <td className="px-5 py-2.5 font-mono">{i + 1}</td>
                    <td className="px-2 py-2.5 font-mono text-xs">{shortenAddress(u.wallet, 6)}</td>
                    <td className="px-2 py-2.5 text-right font-mono">{u.swaps}</td>
                    <td className="px-5 py-2.5 text-right">${formatNumber(u.volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

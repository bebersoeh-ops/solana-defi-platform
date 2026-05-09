"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { AddressInput } from "@/components/tools/address-input";
import { formatNumber, shortenAddress } from "@/lib/utils";

export default function HoldersPage() {
  const section = SECTIONS.find((s) => s.href === "/tools")!;
  const dist = useMemo(
    () => [
      { range: "Top 1", pct: 18 },
      { range: "2–10", pct: 24 },
      { range: "11–50", pct: 19 },
      { range: "51–200", pct: 14 },
      { range: "201–1k", pct: 12 },
      { range: "1k+", pct: 13 },
    ],
    []
  );
  const top = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        address: `Hod${"abcdef0123".repeat(2)}${i}xyz`,
        pct: Math.max(0.5, 18 - i * 1.6 + Math.random() * 0.4),
      })),
    []
  );

  return (
    <SectionShell
      title="Holder Distribution"
      description="Concentration breakdown for any SPL token."
      badge="Bucketed"
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-primary" /> Token
            </CardTitle>
            <CardDescription>Paste an SPL mint to inspect.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="SPL mint address…" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Mini label="Total holders" value={formatNumber(28429)} />
              <Mini label="Active 7d" value={formatNumber(8211)} />
              <Mini label="Whales (>1%)" value="14" />
              <Mini label="Average bag" value="$314" />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="size-4 text-amber-400" /> Distribution
            </CardTitle>
            <CardDescription>Share of supply by rank bucket</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist}>
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                  formatter={(v: unknown) => `${v}%`}
                />
                <Bar dataKey="pct" fill="hsl(var(--neon-blue))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Top 10 holders</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <tr>
                  <th className="text-left px-5 py-2">#</th>
                  <th className="text-left px-2 py-2">Address</th>
                  <th className="text-right px-5 py-2">% supply</th>
                </tr>
              </thead>
              <tbody>
                {top.map((t) => (
                  <tr key={t.rank} className="border-b border-white/[0.03]">
                    <td className="px-5 py-2.5 font-mono">{t.rank}</td>
                    <td className="px-2 py-2.5 font-mono text-xs">{shortenAddress(t.address, 6)}</td>
                    <td className="px-5 py-2.5 text-right font-mono">{t.pct.toFixed(2)}%</td>
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

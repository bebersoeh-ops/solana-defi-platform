"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressInput } from "@/components/tools/address-input";
import { Activity, ChartBar, Coins } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { formatNumber, formatUsd } from "@/lib/utils";

export default function WalletAnalyzerPage() {
  const section = SECTIONS.find((s) => s.href === "/tools")!;
  const data = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        day: i,
        swaps: Math.floor(Math.random() * 14),
        volume: Math.random() * 12_000,
      })),
    []
  );
  const totalVol = data.reduce((s, d) => s + d.volume, 0);

  return (
    <SectionShell
      title="Wallet Analyzer"
      description="Deep-dive on any Solana wallet: token holdings, activity cadence, swap stats."
      badge="Read-only"
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-primary" /> Lookup
            </CardTitle>
            <CardDescription>Paste any base58 wallet address.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="Wallet address…" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Mini label="Total volume" value={formatUsd(totalVol)} />
              <Mini label="Swaps (30d)" value={formatNumber(data.reduce((s, d) => s + d.swaps, 0))} />
              <Mini label="Avg swap size" value={formatUsd(totalVol / 100)} />
              <Mini label="Active days" value={`${data.filter((d) => d.swaps > 0).length}/30`} />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="size-4 text-primary" /> Daily activity
            </CardTitle>
            <CardDescription>Mock 30-day swap activity</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
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
                <Bar dataKey="swaps" fill="hsl(var(--neon-mint))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
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

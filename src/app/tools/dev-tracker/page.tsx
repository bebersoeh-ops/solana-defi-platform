"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Activity, AlertTriangle } from "lucide-react";
import { AddressInput } from "@/components/tools/address-input";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatRelativeTime, shortenAddress } from "@/lib/utils";

export default function DevTrackerPage() {
  const section = SECTIONS.find((s) => s.href === "/tools")!;
  const data = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        d: i,
        actions: Math.floor(Math.random() * 5),
      })),
    []
  );
  const events = useMemo(
    () => [
      { id: "ev-1", t: Date.now() - 60_000, kind: "mint", note: "Minted 50k SPL", tone: "warning" as const },
      { id: "ev-2", t: Date.now() - 8 * 3600_000, kind: "transfer", note: "Sent 12k USDC to MEXC", tone: "info" as const },
      { id: "ev-3", t: Date.now() - 36 * 3600_000, kind: "transfer", note: "Sent 8 SOL to multisig", tone: "secondary" as const },
      { id: "ev-4", t: Date.now() - 7 * 86_400_000, kind: "deploy", note: "Deployed program upgrade", tone: "success" as const },
    ],
    []
  );

  return (
    <SectionShell
      title="Dev Wallet Tracker"
      description="Watch a project's deployer wallet for transfers, mints, and program changes."
      badge="Watchlist"
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="size-4 text-primary" /> Track wallet
            </CardTitle>
            <CardDescription>Get a notification on every mint or transfer.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="Dev wallet…" />
            <div className="mt-3 text-[11px] text-muted-foreground rounded-lg border border-dashed border-white/10 px-3 py-2">
              Connect your own webhook (Helius / Phantom) to wire alerts to Slack or Discord.
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-primary" /> 30d activity
            </CardTitle>
            <CardDescription>Outbound action count per day</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] pl-1 pr-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="devFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--neon-pink))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--neon-pink))" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area dataKey="actions" stroke="hsl(var(--neon-pink))" strokeWidth={2} fill="url(#devFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-300" />
            Notable events
          </CardTitle>
          <CardDescription>Mock recent dev wallet events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {events.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <Badge variant={e.tone} className="text-[9px] uppercase">
                  {e.kind}
                </Badge>
                <span className="text-xs">{e.note}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">{formatRelativeTime(e.t)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </SectionShell>
  );
}

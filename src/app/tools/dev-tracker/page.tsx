"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressInput } from "@/components/tools/address-input";
import { Badge } from "@/components/ui/badge";
import { Activity, ChartBar, Code2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  fetchAccountSnapshot,
  fetchSignaturesForAddress,
  type AccountSnapshot,
  type RpcSignature,
} from "@/lib/market-data";
import { formatNumber, formatRelativeTime, shortenAddress } from "@/lib/utils";

interface TrackerState {
  address: string;
  account: AccountSnapshot | null;
  sigs: RpcSignature[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default function DevTrackerPage() {
  const [state, setState] = useState<TrackerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(address: string) {
    setLoading(true);
    setError(null);
    try {
      const [account, sigs] = await Promise.all([
        fetchAccountSnapshot(address),
        fetchSignaturesForAddress(address, 50),
      ]);
      setState({ address, account, sigs });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState(null);
    } finally {
      setLoading(false);
    }
  }

  const series = useMemo(() => {
    const sigs = state?.sigs ?? [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const buckets = new Map<number, { day: string; tx: number; failed: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * MS_PER_DAY);
      buckets.set(d.getTime(), {
        day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        tx: 0,
        failed: 0,
      });
    }
    for (const s of sigs) {
      if (!s.blockTime) continue;
      const d = new Date(s.blockTime * 1000);
      d.setHours(0, 0, 0, 0);
      const bucket = buckets.get(d.getTime());
      if (!bucket) continue;
      bucket.tx += 1;
      if (s.err) bucket.failed += 1;
    }
    return [...buckets.values()];
  }, [state]);

  const stats = useMemo(() => {
    const sigs = state?.sigs ?? [];
    const failed = sigs.filter((s) => s.err).length;
    const activeDays = new Set(
      sigs
        .filter((s) => s.blockTime != null)
        .map((s) => {
          const d = new Date((s.blockTime ?? 0) * 1000);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        }),
    ).size;
    const lastSeen = sigs[0]?.blockTime ? sigs[0].blockTime * 1000 : null;
    return {
      totalTx: sigs.length,
      failed,
      successRate:
        sigs.length > 0 ? ((sigs.length - failed) / sigs.length) * 100 : 0,
      activeDays,
      lastSeen,
    };
  }, [state]);

  return (
    <SectionShell
      title="Dev Wallet Tracker"
      description="Live RPC snapshot of a deployer wallet — last 50 signatures, daily activity, and balance."
      badge={loading ? "Loading" : state ? "Live · 50 sigs" : "Watchlist"}
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="size-4 text-primary" /> Track wallet
            </CardTitle>
            <CardDescription>
              Paste any base58 wallet — pulled from Solana mainnet RPC.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="Dev wallet…" onSubmit={load} />
            {error ? (
              <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
                {error}
              </div>
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              ) : state ? (
                <>
                  <Mini
                    label="SOL balance"
                    value={
                      state.account?.exists
                        ? `${(state.account.lamports / 1e9).toFixed(4)} SOL`
                        : "—"
                    }
                  />
                  <Mini
                    label="Tx (last 50)"
                    value={formatNumber(stats.totalTx)}
                  />
                  <Mini
                    label="Success rate"
                    value={`${stats.successRate.toFixed(1)}%`}
                  />
                  <Mini label="Active days" value={`${stats.activeDays}/30`} />
                  <Mini
                    label="Owner program"
                    value={shortenAddress(state.account?.owner ?? "—", 4)}
                  />
                  <Mini
                    label="Last seen"
                    value={
                      stats.lastSeen
                        ? formatRelativeTime(stats.lastSeen)
                        : "—"
                    }
                  />
                </>
              ) : (
                <div className="col-span-2 rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-6 text-center text-xs text-muted-foreground">
                  Enter a wallet to track.
                </div>
              )}
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground rounded-lg border border-dashed border-white/10 px-3 py-2">
              Webhooks (Helius / Phantom) needed for push alerts — Lumen runs
              read-only against the public RPC.
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-primary" /> 30d activity
            </CardTitle>
            <CardDescription>
              {state
                ? `Live · ${stats.totalTx} signatures bucketed by day`
                : "Submit a wallet to see daily action count."}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 pl-1 pr-3 pb-3">
            {loading ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : !state ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                <ChartBar className="size-4 mr-2" />
                No data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      background: "rgba(10,12,18,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="tx" fill="hsl(var(--neon-pink))" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="failed" fill="#f87171" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Recent signatures</CardTitle>
          <CardDescription>
            {state
              ? "Live · last 50 signatures from getSignaturesForAddress."
              : "Submit a wallet to load recent signatures."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <tr>
                  <th className="text-left px-5 py-2">Signature</th>
                  <th className="text-left px-2 py-2">Slot</th>
                  <th className="text-left px-2 py-2">Time</th>
                  <th className="text-right px-5 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td colSpan={4} className="px-5 py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : !state || state.sigs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-xs text-muted-foreground"
                    >
                      {state ? "No signatures returned." : "No wallet loaded."}
                    </td>
                  </tr>
                ) : (
                  state.sigs.slice(0, 25).map((s) => (
                    <tr
                      key={s.signature}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-2.5 font-mono text-xs">
                        <a
                          href={`https://solscan.io/tx/${s.signature}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-foreground"
                        >
                          {shortenAddress(s.signature, 8)} ↗
                        </a>
                      </td>
                      <td className="px-2 py-2.5 font-mono text-xs text-muted-foreground">
                        {formatNumber(s.slot, 0)}
                      </td>
                      <td className="px-2 py-2.5 text-xs text-muted-foreground">
                        {s.blockTime ? formatRelativeTime(s.blockTime * 1000) : "—"}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <Badge
                          variant={s.err ? "destructive" : "success"}
                          className="text-[9px] uppercase"
                        >
                          {s.err ? "failed" : "success"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
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

"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressInput } from "@/components/tools/address-input";
import { Activity, ChartBar } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  fetchAccountSnapshot,
  fetchSignaturesForAddress,
  type AccountSnapshot,
  type RpcSignature,
} from "@/lib/market-data";
import { formatNumber, shortenAddress } from "@/lib/utils";

interface AnalysisState {
  address: string;
  account: AccountSnapshot | null;
  sigs: RpcSignature[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default function WalletAnalyzerPage() {
  const [state, setState] = useState<AnalysisState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(address: string) {
    setLoading(true);
    setError(null);
    try {
      const [account, sigs] = await Promise.all([
        fetchAccountSnapshot(address),
        fetchSignaturesForAddress(address, 100),
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
    if (sigs.length === 0) return [];
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
    return {
      totalTx: sigs.length,
      failed,
      successRate:
        sigs.length > 0 ? ((sigs.length - failed) / sigs.length) * 100 : 0,
      activeDays,
    };
  }, [state]);

  return (
    <SectionShell
      title="Wallet Analyzer"
      description="Live RPC analysis of any Solana wallet's recent activity (last 100 signatures)."
      badge={loading ? "Loading" : state ? "Live" : "Read-only"}
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-primary" /> Lookup
            </CardTitle>
            <CardDescription>
              Paste any base58 wallet address — pulled from Solana mainnet RPC.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="Wallet address…" onSubmit={analyze} />
            {error ? (
              <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
                {error}
              </div>
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
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
                  <Mini label="Tx (last 100)" value={formatNumber(stats.totalTx)} />
                  <Mini
                    label="Success rate"
                    value={`${stats.successRate.toFixed(1)}%`}
                  />
                  <Mini label="Active days" value={`${stats.activeDays}/30`} />
                  <Mini label="Owner program" value={shortenAddress(state.account?.owner ?? "—", 4)} />
                  <Mini label="Failed tx" value={formatNumber(stats.failed)} />
                </>
              ) : (
                <div className="col-span-2 rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-6 text-center text-xs text-muted-foreground">
                  Enter an address to analyze.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="size-4 text-primary" /> Daily activity (30d)
            </CardTitle>
            <CardDescription>
              {state
                ? `Live · ${stats.totalTx} signatures over the last 30 days`
                : "Submit an address to see daily transaction count."}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pl-1 pr-3 pb-3">
            {loading ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : !state ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
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
                  <Bar dataKey="tx" fill="hsl(var(--neon-mint))" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="failed" fill="#f87171" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
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

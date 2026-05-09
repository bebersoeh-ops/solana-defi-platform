"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { AddressInput } from "@/components/tools/address-input";
import {
  fetchTokenLargestAccounts,
  fetchTokenSupply,
  type TokenLargestAccount,
} from "@/lib/market-data";
import { formatNumber, shortenAddress } from "@/lib/utils";

interface HoldersState {
  mint: string;
  supply: number;
  decimals: number;
  largest: TokenLargestAccount[];
}

export default function HoldersPage() {
  const [state, setState] = useState<HoldersState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(mint: string) {
    setLoading(true);
    setError(null);
    try {
      const [supply, largest] = await Promise.all([
        fetchTokenSupply(mint),
        fetchTokenLargestAccounts(mint),
      ]);
      if (!supply) {
        setError("Mint not found or not an SPL token.");
        setState(null);
        return;
      }
      setState({
        mint,
        supply: supply.uiAmount,
        decimals: supply.decimals,
        largest,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState(null);
    } finally {
      setLoading(false);
    }
  }

  const dist = useMemo(() => {
    if (!state || state.supply <= 0) return [];
    const buckets = [
      { range: "Top 1", from: 0, to: 1 },
      { range: "2–5", from: 1, to: 5 },
      { range: "6–10", from: 5, to: 10 },
      { range: "11–20", from: 10, to: 20 },
    ] as const;
    return buckets.map((b) => {
      const slice = state.largest.slice(b.from, b.to);
      const sum = slice.reduce((s, x) => s + x.uiAmount, 0);
      return { range: b.range, pct: (sum / state.supply) * 100 };
    });
  }, [state]);

  const top10 = useMemo(
    () => (state ? state.largest.slice(0, 10) : []),
    [state],
  );

  const topShare = useMemo(() => {
    if (!state || state.supply <= 0) return 0;
    return (
      (state.largest.slice(0, 10).reduce((s, x) => s + x.uiAmount, 0) /
        state.supply) *
      100
    );
  }, [state]);

  return (
    <SectionShell
      title="Holder Distribution"
      description="Top 20 SPL token accounts pulled live from Solana RPC (getTokenLargestAccounts)."
      badge={loading ? "Loading" : state ? "Live · top 20" : "Awaiting input"}
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-primary" /> Token
            </CardTitle>
            <CardDescription>Paste an SPL mint to inspect on-chain.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="SPL mint address…" onSubmit={load} />
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
                    label="Supply"
                    value={formatNumber(state.supply, 0)}
                  />
                  <Mini label="Decimals" value={String(state.decimals)} />
                  <Mini label="Top-10 share" value={`${topShare.toFixed(2)}%`} />
                  <Mini label="Top-1 share" value={`${(dist[0]?.pct ?? 0).toFixed(2)}%`} />
                </>
              ) : (
                <div className="col-span-2 rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-6 text-center text-xs text-muted-foreground">
                  Enter a mint to inspect.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="size-4 text-amber-400" /> Distribution
            </CardTitle>
            <CardDescription>
              Share of supply across the top-20 token accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pl-1 pr-3 pb-3">
            {loading ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : !state ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dist}>
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,12,18,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      fontSize: 11,
                    }}
                    formatter={(v: unknown) => `${(Number(v) || 0).toFixed(2)}%`}
                  />
                  <Bar dataKey="pct" fill="hsl(var(--neon-blue))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Top 10 holders</CardTitle>
          <CardDescription>
            {state
              ? "Live · token accounts (not always wallets — could be pools, lockers, etc.)."
              : "Submit a mint to load the top 10 holders."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <tr>
                  <th className="text-left px-5 py-2">#</th>
                  <th className="text-left px-2 py-2">Token account</th>
                  <th className="text-right px-2 py-2">Amount</th>
                  <th className="text-right px-5 py-2">% supply</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/[0.03]">
                        <td colSpan={4} className="px-5 py-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : top10.length === 0
                    ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-xs text-muted-foreground">
                          {state ? "No holder data returned." : "No mint loaded."}
                        </td>
                      </tr>
                    )
                    : top10.map((t, i) => {
                        const pct =
                          state && state.supply > 0
                            ? (t.uiAmount / state.supply) * 100
                            : 0;
                        return (
                          <tr key={t.address} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                            <td className="px-5 py-2.5 font-mono">{i + 1}</td>
                            <td className="px-2 py-2.5 font-mono text-xs">
                              <a
                                href={`https://solscan.io/account/${t.address}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-foreground"
                              >
                                {shortenAddress(t.address, 6)} ↗
                              </a>
                            </td>
                            <td className="px-2 py-2.5 text-right font-mono text-xs">
                              {formatNumber(t.uiAmount, 0)}
                            </td>
                            <td className="px-5 py-2.5 text-right font-mono">{pct.toFixed(2)}%</td>
                          </tr>
                        );
                      })}
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

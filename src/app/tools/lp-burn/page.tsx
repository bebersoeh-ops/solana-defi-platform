"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressInput } from "@/components/tools/address-input";
import { Badge } from "@/components/ui/badge";
import { Flame, Lock, Unlock, AlertTriangle } from "lucide-react";
import {
  fetchTokenAccountOwners,
  fetchTokenLargestAccounts,
  fetchTokenSupply,
  type ParsedTokenAccount,
  type TokenLargestAccount,
} from "@/lib/market-data";
import { formatNumber, shortenAddress } from "@/lib/utils";

const BURN_OWNERS = new Set<string>([
  "1nc1nerator11111111111111111111111111111111",
  "11111111111111111111111111111111",
  "deaddeaddeaddeaddeaddeaddeaddeaddeaddead",
]);

interface HolderRow {
  account: TokenLargestAccount;
  owner: string | null;
  burned: boolean;
  pct: number;
}

interface LpBurnState {
  mint: string;
  supply: number;
  decimals: number;
  rows: HolderRow[];
  burnedPct: number;
  freePct: number;
  unresolvedPct: number;
}

export default function LpBurnPage() {
  const [state, setState] = useState<LpBurnState | null>(null);
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
      const owners = largest.length
        ? await fetchTokenAccountOwners(largest.map((a) => a.address))
        : [];
      const rows: HolderRow[] = largest.map((account, i) => {
        const parsed: ParsedTokenAccount | null = owners[i] ?? null;
        const owner = parsed?.owner ?? null;
        const burned = owner ? BURN_OWNERS.has(owner) : false;
        const pct = supply.uiAmount > 0 ? (account.uiAmount / supply.uiAmount) * 100 : 0;
        return { account, owner, burned, pct };
      });
      const burnedPct = rows
        .filter((r) => r.burned)
        .reduce((s, r) => s + r.pct, 0);
      const unresolvedPct = rows
        .filter((r) => !r.owner)
        .reduce((s, r) => s + r.pct, 0);
      const accountedPct = rows.reduce((s, r) => s + r.pct, 0);
      const freePct = Math.max(0, accountedPct - burnedPct - unresolvedPct);
      setState({
        mint,
        supply: supply.uiAmount,
        decimals: supply.decimals,
        rows,
        burnedPct,
        freePct,
        unresolvedPct,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState(null);
    } finally {
      setLoading(false);
    }
  }

  const verdict = useMemo(() => {
    if (!state) return null;
    if (state.burnedPct >= 95)
      return { label: "Likely burned", tone: "emerald" as const };
    if (state.burnedPct >= 50)
      return { label: "Partially burned", tone: "emerald" as const };
    if (state.burnedPct > 0)
      return { label: "Some burn", tone: "amber" as const };
    return { label: "No burn detected", tone: "rose" as const };
  }, [state]);

  return (
    <SectionShell
      title="LP Burn Checker"
      description="Resolve the wallet owners of an LP mint's largest token accounts and tag those held by the SPL incinerator or system program as burned."
      badge={loading ? "Scanning" : state ? "Live · top 20" : "Heuristic"}
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-4 text-amber-400" /> LP mint
            </CardTitle>
            <CardDescription>
              Paste a Solana LP / pool token mint address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="LP token mint…" onSubmit={load} />
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
                  <Mini label="Supply" value={formatNumber(state.supply, 0)} />
                  <Mini label="Decimals" value={String(state.decimals)} />
                  <Mini
                    label="Top-20 share"
                    value={`${(state.burnedPct + state.freePct + state.unresolvedPct).toFixed(2)}%`}
                  />
                  <Mini
                    label="Unresolved"
                    value={`${state.unresolvedPct.toFixed(2)}%`}
                  />
                </>
              ) : (
                <div className="col-span-2 rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-6 text-center text-xs text-muted-foreground">
                  Enter an LP mint to inspect.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>LP status</CardTitle>
            <CardDescription>
              {state
                ? `Live · ${verdict?.label ?? "—"} · burn vs free across the top-20 token accounts.`
                : "Submit an LP mint to compute burn vs free percentages."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))
            ) : state ? (
              <>
                <Status
                  icon={<Flame className="size-4" />}
                  label="Burned"
                  value={`${state.burnedPct.toFixed(2)}%`}
                  tone="emerald"
                />
                <Status
                  icon={<Unlock className="size-4" />}
                  label="Free-floating"
                  value={`${state.freePct.toFixed(2)}%`}
                  tone={state.freePct > 25 ? "rose" : state.freePct > 5 ? "amber" : "emerald"}
                />
                <Status
                  icon={<Lock className="size-4" />}
                  label="Unresolved"
                  value={`${state.unresolvedPct.toFixed(2)}%`}
                  tone={state.unresolvedPct > 0 ? "amber" : "emerald"}
                />
              </>
            ) : (
              <div className="sm:col-span-3 rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-10 text-center text-xs text-muted-foreground">
                No data yet.
              </div>
            )}
          </CardContent>
          <CardContent className="pt-0">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
              <span>
                Heuristic: only inspects the largest 20 token accounts. Some
                pools lock LP via Streamflow / vaults — those will appear as
                free-floating here.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Top holders</CardTitle>
          <CardDescription>
            {state
              ? "Live · token accounts (not always wallets — pools, lockers, etc.)."
              : "Submit an LP mint to load top holders."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <tr>
                  <th className="text-left px-5 py-2">#</th>
                  <th className="text-left px-2 py-2">Token account</th>
                  <th className="text-left px-2 py-2">Owner</th>
                  <th className="text-right px-2 py-2">Amount</th>
                  <th className="text-right px-2 py-2">% supply</th>
                  <th className="text-right px-5 py-2">State</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td colSpan={6} className="px-5 py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : !state || state.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-xs text-muted-foreground"
                    >
                      {state ? "No holder data returned." : "No mint loaded."}
                    </td>
                  </tr>
                ) : (
                  state.rows.map((row, i) => (
                    <tr
                      key={row.account.address}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-2.5 font-mono">{i + 1}</td>
                      <td className="px-2 py-2.5 font-mono text-xs">
                        <a
                          href={`https://solscan.io/account/${row.account.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-foreground"
                        >
                          {shortenAddress(row.account.address, 6)} ↗
                        </a>
                      </td>
                      <td className="px-2 py-2.5 font-mono text-xs text-muted-foreground">
                        {row.owner ? (
                          <a
                            href={`https://solscan.io/account/${row.owner}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-foreground"
                          >
                            {shortenAddress(row.owner, 6)} ↗
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono text-xs">
                        {formatNumber(row.account.uiAmount, 0)}
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono">
                        {row.pct.toFixed(2)}%
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <Badge
                          variant={row.burned ? "success" : row.owner ? "warning" : "secondary"}
                          className="text-[9px] uppercase"
                        >
                          {row.burned ? "burned" : row.owner ? "free" : "unknown"}
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

function Status({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "amber" | "rose";
}) {
  const c = {
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-400",
  } as const;
  return (
    <div className={`rounded-lg border ${c[tone]} px-3 py-3`}>
      <div className="flex items-center gap-2 text-xs">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
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

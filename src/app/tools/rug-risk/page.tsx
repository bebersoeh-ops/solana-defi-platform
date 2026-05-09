"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressInput } from "@/components/tools/address-input";
import { ShieldAlert, AlertTriangle, BarChart3 } from "lucide-react";
import {
  fetchMintInfo,
  fetchTokenLargestAccounts,
  fetchTokenSupply,
  fetchDexScreenerPairsByMint,
  type MintInfo,
  type TokenLargestAccount,
  type DexScreenerPair,
} from "@/lib/market-data";

interface RiskState {
  mint: string;
  info: MintInfo;
  supply: number;
  largest: TokenLargestAccount[];
  pairs: DexScreenerPair[];
}

interface Factor {
  name: string;
  weight: number;
  score: number;
  detail: string;
}

export default function RugRiskPage() {
  const [state, setState] = useState<RiskState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(mint: string) {
    setLoading(true);
    setError(null);
    try {
      const [info, supply, largest, pairs] = await Promise.all([
        fetchMintInfo(mint),
        fetchTokenSupply(mint),
        fetchTokenLargestAccounts(mint),
        fetchDexScreenerPairsByMint(mint),
      ]);
      if (!info || !supply) {
        setError("Mint not found or not an SPL token.");
        setState(null);
        return;
      }
      setState({
        mint,
        info,
        supply: supply.uiAmount,
        largest,
        pairs,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState(null);
    } finally {
      setLoading(false);
    }
  }

  const factors: Factor[] = useMemo(() => {
    if (!state) return [];
    const top10Share =
      state.supply > 0
        ? state.largest.slice(0, 10).reduce((s, x) => s + x.uiAmount, 0) /
          state.supply
        : 1;
    const top1Share =
      state.supply > 0 && state.largest[0]
        ? state.largest[0].uiAmount / state.supply
        : 1;
    const totalLiquidity = state.pairs.reduce(
      (s, p) => s + (p.liquidity?.usd ?? 0),
      0,
    );
    const dexCount = new Set(state.pairs.map((p) => p.dexId)).size;
    const totalVol24h = state.pairs.reduce(
      (s, p) => s + (p.volume?.h24 ?? 0),
      0,
    );

    return [
      {
        name: "Holder concentration",
        weight: 0.3,
        score: Math.max(0, Math.round(100 - top10Share * 100)),
        detail: `Top 10 hold ${(top10Share * 100).toFixed(1)}% of supply.`,
      },
      {
        name: "Top holder dominance",
        weight: 0.18,
        score: Math.max(0, Math.round(100 - top1Share * 200)),
        detail: `Top account holds ${(top1Share * 100).toFixed(1)}% of supply.`,
      },
      {
        name: "Mint authority renounced",
        weight: 0.18,
        score: state.info.mintAuthority ? 0 : 100,
        detail: state.info.mintAuthority
          ? "Mint authority is still active."
          : "Mint authority is null.",
      },
      {
        name: "Freeze authority disabled",
        weight: 0.1,
        score: state.info.freezeAuthority ? 30 : 100,
        detail: state.info.freezeAuthority
          ? "Freeze authority is set."
          : "Freeze authority is null.",
      },
      {
        name: "On-chain liquidity",
        weight: 0.14,
        score: Math.min(
          100,
          Math.round((Math.log10(Math.max(1, totalLiquidity)) / 6) * 100),
        ),
        detail: `Aggregate DEX liquidity: $${totalLiquidity.toLocaleString()}.`,
      },
      {
        name: "DEX diversity",
        weight: 0.05,
        score: Math.min(100, dexCount * 25),
        detail: `Listed on ${dexCount} DEX${dexCount === 1 ? "" : "s"}.`,
      },
      {
        name: "24h trading activity",
        weight: 0.05,
        score: Math.min(
          100,
          Math.round((Math.log10(Math.max(1, totalVol24h)) / 6) * 100),
        ),
        detail: `24h volume across pairs: $${totalVol24h.toLocaleString()}.`,
      },
    ];
  }, [state]);

  const composite = useMemo(() => {
    if (factors.length === 0) return 0;
    return Math.round(
      factors.reduce((s, f) => s + f.score * f.weight, 0),
    );
  }, [factors]);

  const rating =
    composite >= 80 ? "Low" : composite >= 60 ? "Medium" : composite > 0 ? "High" : "—";
  const tone =
    composite >= 80
      ? "text-emerald-400"
      : composite >= 60
        ? "text-amber-400"
        : composite > 0
          ? "text-rose-400"
          : "text-muted-foreground";

  return (
    <SectionShell
      title="Rug Risk Checker"
      description="Composite rug-risk score from live RPC + DexScreener signals."
      badge={loading ? "Scanning" : state ? "Live · heuristic" : "Heuristic"}
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-300" /> Composite score
            </CardTitle>
            <CardDescription>Higher = safer.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-5 text-center">
              {loading ? (
                <Skeleton className="h-12 w-24 mx-auto" />
              ) : (
                <div className={`text-5xl font-semibold ${tone}`}>
                  {state ? composite : "—"}
                </div>
              )}
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                {state ? `${rating} risk` : "submit a mint"}
              </div>
            </div>
            <div className="mt-4">
              <AddressInput placeholder="SPL mint address…" onSubmit={load} />
              {error ? (
                <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
                  {error}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" /> Factors
            </CardTitle>
            <CardDescription>
              {state
                ? "Live · weighted score per signal."
                : "Submit a mint to compute factors."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : !state ? (
              <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-10 text-center text-sm text-muted-foreground">
                No mint loaded yet.
              </div>
            ) : (
              factors.map((f) => (
                <div key={f.name}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span>
                      {f.name}{" "}
                      <span className="text-muted-foreground/60">
                        · weight {(f.weight * 100).toFixed(0)}%
                      </span>
                    </span>
                    <span className="font-mono">{f.score}/100</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${f.score >= 80 ? "bg-emerald-400" : f.score >= 60 ? "bg-amber-400" : "bg-rose-400"}`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 mt-1">
                    {f.detail}
                  </div>
                </div>
              ))
            )}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
              <span>
                Heuristic only — never treat as a guarantee. Always verify
                contract details independently.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

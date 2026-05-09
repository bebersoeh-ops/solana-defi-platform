"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressInput } from "@/components/tools/address-input";
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import {
  fetchMintInfo,
  fetchTokenLargestAccounts,
  fetchTokenSupply,
  fetchDexScreenerPairsByMint,
  type MintInfo,
  type TokenLargestAccount,
  type DexScreenerPair,
} from "@/lib/market-data";

interface SecState {
  mint: string;
  info: MintInfo | null;
  supply: number;
  largest: TokenLargestAccount[];
  pairs: DexScreenerPair[];
}

export default function SecurityPage() {
  const [state, setState] = useState<SecState | null>(null);
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

  const checks = useMemo(() => {
    if (!state || !state.info) return [];
    const top10Share =
      state.supply > 0
        ? state.largest.slice(0, 10).reduce((s, x) => s + x.uiAmount, 0) /
          state.supply
        : 0;
    const top1Share =
      state.supply > 0 && state.largest[0]
        ? state.largest[0].uiAmount / state.supply
        : 0;
    const liquidity = state.pairs.reduce(
      (s, p) => s + (p.liquidity?.usd ?? 0),
      0,
    );
    const dexCount = new Set(state.pairs.map((p) => p.dexId)).size;
    return [
      {
        key: "mint_authority",
        label: "Mint authority renounced",
        state: state.info.mintAuthority ? ("fail" as const) : ("pass" as const),
        detail: state.info.mintAuthority
          ? "Mint authority is still active — supply can be inflated."
          : "Mint authority is null.",
      },
      {
        key: "freeze_authority",
        label: "Freeze authority disabled",
        state: state.info.freezeAuthority
          ? ("warn" as const)
          : ("pass" as const),
        detail: state.info.freezeAuthority
          ? "Freeze authority is set — accounts can be frozen."
          : "Freeze authority is null.",
      },
      {
        key: "owner_concentration",
        label: "Top 10 holders < 60%",
        state:
          top10Share < 0.6
            ? ("pass" as const)
            : top10Share < 0.85
              ? ("warn" as const)
              : ("fail" as const),
        detail: `Top 10 token accounts hold ${(top10Share * 100).toFixed(2)}% of supply.`,
      },
      {
        key: "top_holder",
        label: "Top holder < 30%",
        state:
          top1Share < 0.3
            ? ("pass" as const)
            : top1Share < 0.5
              ? ("warn" as const)
              : ("fail" as const),
        detail: `Top token account holds ${(top1Share * 100).toFixed(2)}% of supply.`,
      },
      {
        key: "liquidity",
        label: "On-chain liquidity ≥ $50k",
        state:
          liquidity >= 50_000
            ? ("pass" as const)
            : liquidity >= 5_000
              ? ("warn" as const)
              : ("fail" as const),
        detail: `Aggregate DEX liquidity: $${liquidity.toLocaleString()}.`,
      },
      {
        key: "dex_diversity",
        label: "Listed on ≥ 2 DEXs",
        state:
          dexCount >= 2
            ? ("pass" as const)
            : dexCount === 1
              ? ("warn" as const)
              : ("fail" as const),
        detail:
          dexCount > 0
            ? `Listed on: ${Array.from(new Set(state.pairs.map((p) => p.dexId))).join(", ")}`
            : "No DEX pairs found.",
      },
      {
        key: "initialized",
        label: "Mint initialized",
        state: state.info.isInitialized ? ("pass" as const) : ("fail" as const),
        detail: state.info.isInitialized
          ? "Mint is properly initialized."
          : "Mint is not initialized.",
      },
    ];
  }, [state]);

  return (
    <SectionShell
      title="Token Security Checker"
      description="Run a battery of safety checks on any SPL token mint — live RPC + DEX data."
      badge={loading ? "Scanning" : state ? "Live · audit" : "Audit"}
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-4 text-primary" /> Security checks
            </CardTitle>
            <CardDescription>
              {state
                ? "Live results sourced from Solana mainnet RPC + DexScreener."
                : "Submit a mint to run live checks."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {error ? (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
                {error}
              </div>
            ) : null}
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : !state ? (
              <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-10 text-center text-sm text-muted-foreground">
                Submit a mint above to run security checks.
              </div>
            ) : (
              checks.map((c) => (
                <CheckRow
                  key={c.key}
                  label={c.label}
                  state={c.state}
                  detail={c.detail}
                />
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mint address</CardTitle>
            <CardDescription>Paste an SPL mint to scan.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="SPL mint address…" onSubmit={load} />
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function CheckRow({
  label,
  state,
  detail,
}: {
  label: string;
  state: "pass" | "warn" | "fail";
  detail?: string;
}) {
  const conf = {
    pass: {
      icon: <ShieldCheck className="size-4 text-emerald-400" />,
      bg: "border-emerald-500/20 bg-emerald-500/5",
      txt: "Passing",
    },
    warn: {
      icon: <ShieldAlert className="size-4 text-amber-400" />,
      bg: "border-amber-500/20 bg-amber-500/5",
      txt: "Review",
    },
    fail: {
      icon: <ShieldX className="size-4 text-rose-400" />,
      bg: "border-rose-500/20 bg-rose-500/5",
      txt: "Failing",
    },
  } as const;
  const c = conf[state];
  return (
    <div
      className={`flex items-center justify-between rounded-lg border ${c.bg} px-3 py-2.5`}
    >
      <div className="flex items-center gap-2.5">
        {c.icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground">{c.txt}</span>
    </div>
  );
}

"use client";

import { useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressInput } from "@/components/tools/address-input";
import { FileJson, Tag, Hash, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  fetchMintInfo,
  fetchDexScreenerPairsByMint,
  type MintInfo,
  type DexScreenerPair,
} from "@/lib/market-data";
import { shortenAddress, formatNumber, formatUsd } from "@/lib/utils";

interface MetadataState {
  mint: string;
  info: MintInfo | null;
  pairs: DexScreenerPair[];
}

export default function MetadataPage() {
  const [state, setState] = useState<MetadataState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(mint: string) {
    setLoading(true);
    setError(null);
    try {
      const [info, pairs] = await Promise.all([
        fetchMintInfo(mint),
        fetchDexScreenerPairsByMint(mint),
      ]);
      setState({ mint, info, pairs });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState(null);
    } finally {
      setLoading(false);
    }
  }

  const tokenInfo = state?.pairs[0]
    ? state.pairs[0].baseToken.address.toLowerCase() === state.mint.toLowerCase()
      ? state.pairs[0].baseToken
      : state.pairs[0].quoteToken
    : null;

  return (
    <SectionShell
      title="Token Metadata Viewer"
      description="Live SPL mint authorities + DEX listing presence."
      badge={loading ? "Loading" : state ? "Live · RPC + DEX" : "RPC + DEX"}
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="size-4 text-primary" /> Mint address
            </CardTitle>
            <CardDescription>Paste any SPL mint to view metadata.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="SPL mint…" onSubmit={load} />
            {error ? (
              <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="size-4 text-primary" /> Metadata
            </CardTitle>
            <CardDescription>
              {state
                ? "Live data via Solana RPC (jsonParsed mint) + DexScreener token endpoint."
                : "Live data — submit a mint to inspect."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </>
            ) : !state || !state.info ? (
              <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-10 text-center text-sm text-muted-foreground">
                {state ? "No mint data found." : "Submit a mint above to view metadata."}
              </div>
            ) : (
              <>
                <Row
                  icon={<Tag className="size-3.5" />}
                  label="Name"
                  value={tokenInfo?.name ?? "Unknown"}
                />
                <Row
                  icon={<Tag className="size-3.5" />}
                  label="Symbol"
                  value={tokenInfo?.symbol ?? "—"}
                />
                <Row
                  icon={<Hash className="size-3.5" />}
                  label="Decimals"
                  value={String(state.info.decimals)}
                />
                <Row
                  icon={<Hash className="size-3.5" />}
                  label="Supply"
                  value={formatNumber(
                    Number(state.info.supply) / 10 ** state.info.decimals,
                    0,
                  )}
                />
                <Row
                  icon={<Tag className="size-3.5" />}
                  label="Mint authority"
                  value={
                    state.info.mintAuthority
                      ? shortenAddress(state.info.mintAuthority, 6)
                      : "Renounced"
                  }
                  tone={state.info.mintAuthority ? "amber" : "emerald"}
                />
                <Row
                  icon={<Tag className="size-3.5" />}
                  label="Freeze authority"
                  value={
                    state.info.freezeAuthority
                      ? shortenAddress(state.info.freezeAuthority, 6)
                      : "Renounced"
                  }
                  tone={state.info.freezeAuthority ? "amber" : "emerald"}
                />
                <Row
                  icon={<Tag className="size-3.5" />}
                  label="Initialized"
                  value={state.info.isInitialized ? "yes" : "no"}
                  tone={state.info.isInitialized ? "emerald" : "rose"}
                />
                <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                  <span className="text-xs flex items-center gap-1.5">
                    <Globe className="size-3.5 text-muted-foreground" /> DEX listings
                  </span>
                  <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
                    {state.pairs.length === 0 ? (
                      <span className="text-xs text-muted-foreground">none</span>
                    ) : (
                      Array.from(new Set(state.pairs.map((p) => p.dexId)))
                        .slice(0, 6)
                        .map((d) => (
                          <Badge key={d} variant="secondary" className="text-[9px] uppercase">
                            {d}
                          </Badge>
                        ))
                    )}
                  </div>
                </div>
                {state.pairs.length > 0 ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                      Top pair · liquidity
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                      <span className="font-mono text-xs">
                        {shortenAddress(state.pairs[0].pairAddress, 8)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[9px] uppercase">
                          {state.pairs[0].dexId}
                        </Badge>
                        <span className="text-xs">
                          {formatUsd(state.pairs[0].liquidity?.usd ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function Row({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "emerald" | "amber" | "rose";
}) {
  const tones = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  } as const;
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <span className="text-xs flex items-center gap-1.5 text-muted-foreground">
        {icon} {label}
      </span>
      <span className={`text-sm font-medium ${tone ? tones[tone] : ""}`}>{value}</span>
    </div>
  );
}

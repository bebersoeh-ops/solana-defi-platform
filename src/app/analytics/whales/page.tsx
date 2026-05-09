"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Fish, ArrowUpRight } from "lucide-react";
import { TokenIcon } from "@/components/shared/token-icon";
import {
  fetchAllPairsForMints,
  type DexScreenerPair,
} from "@/lib/market-data";
import { STATIC_TOKENS } from "@/lib/tokens";
import { formatCompact, shortenAddress } from "@/lib/utils";

interface PairRow {
  pairAddress: string;
  url: string;
  base: string;
  quote: string;
  baseMint: string;
  dexId: string;
  priceChangeH1: number;
  volumeH1: number;
  buysH1: number;
  sellsH1: number;
  liquidity: number;
  pressure: "buy" | "sell" | "neutral";
}

const REFRESH_MS = 30_000;

export default function WhalesPage() {
  const [pairs, setPairs] = useState<DexScreenerPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      try {
        const all = await fetchAllPairsForMints(
          STATIC_TOKENS.map((t) => t.address),
          controller.signal,
        );
        if (cancelled) return;
        setPairs(all);
        setLastUpdated(Date.now());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(id);
    };
  }, []);

  const rows: PairRow[] = useMemo(() => {
    return [...pairs]
      .filter((p) => (p.volume?.h1 ?? 0) > 50_000)
      .map((p) => {
        const buys = p.txns?.h24?.buys ?? 0;
        const sells = p.txns?.h24?.sells ?? 0;
        const pressure: PairRow["pressure"] =
          buys > sells * 1.15 ? "buy" : sells > buys * 1.15 ? "sell" : "neutral";
        return {
          pairAddress: p.pairAddress,
          url: p.url,
          base: p.baseToken.symbol,
          quote: p.quoteToken.symbol,
          baseMint: p.baseToken.address,
          dexId: p.dexId,
          priceChangeH1: p.priceChange?.h1 ?? 0,
          volumeH1: p.volume?.h1 ?? 0,
          buysH1: buys,
          sellsH1: sells,
          liquidity: p.liquidity?.usd ?? 0,
          pressure,
        };
      })
      .sort((a, b) => b.volumeH1 - a.volumeH1)
      .slice(0, 25);
  }, [pairs]);

  return (
    <SectionShell
      title="Whale Activity"
      description="Live pairs ranked by 1h volume — swap pressure, liquidity & price moves."
      badge={loading ? "Loading" : "Live · 1h"}
      baseHref="/analytics"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="size-4 text-primary" /> Hot Solana pairs
          </CardTitle>
          <CardDescription>
            {lastUpdated
              ? `Top ${rows.length} pairs by 1h volume · live via DexScreener · refreshed ${new Date(lastUpdated).toLocaleTimeString()}`
              : "Loading live pair data from DexScreener…"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">Pair</th>
                  <th className="text-left px-2 py-2 font-medium">DEX</th>
                  <th className="text-right px-2 py-2 font-medium">1h vol</th>
                  <th className="text-right px-2 py-2 font-medium">1h Δ</th>
                  <th className="text-right px-2 py-2 font-medium">Buys / Sells</th>
                  <th className="text-right px-2 py-2 font-medium">Liquidity</th>
                  <th className="text-right px-5 py-2 font-medium">Pair</th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/[0.03]">
                        <td colSpan={7} className="px-5 py-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : rows.map((r) => {
                      const meta = STATIC_TOKENS.find((t) => t.address === r.baseMint);
                      return (
                        <tr key={r.pairAddress} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <TokenIcon src={meta?.logoURI} symbol={r.base} size={22} />
                              <div className="flex items-center gap-1 text-sm">
                                <span className="font-medium">{r.base}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-muted-foreground">{r.quote}</span>
                              </div>
                              <Badge
                                variant={
                                  r.pressure === "buy"
                                    ? "success"
                                    : r.pressure === "sell"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="text-[9px] uppercase"
                              >
                                {r.pressure}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-2 py-2.5 text-xs text-muted-foreground capitalize">
                            {r.dexId}
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono">
                            ${formatCompact(r.volumeH1)}
                          </td>
                          <td
                            className={`px-2 py-2.5 text-right font-mono ${r.priceChangeH1 >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            {r.priceChangeH1 >= 0 ? "+" : ""}
                            {r.priceChangeH1.toFixed(2)}%
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono text-xs text-muted-foreground">
                            <span className="text-emerald-400">{r.buysH1}</span>
                            {" / "}
                            <span className="text-rose-400">{r.sellsH1}</span>
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono">
                            ${formatCompact(r.liquidity)}
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
                            >
                              {shortenAddress(r.pairAddress, 4)}
                              <ArrowUpRight className="size-3" />
                            </a>
                          </td>
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

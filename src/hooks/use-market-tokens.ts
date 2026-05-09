"use client";

import { useEffect, useRef, useState } from "react";
import {
  fetchDexScreenerTokens,
  type LiveTokenStats,
  syntheticSparkline,
} from "@/lib/market-data";
import { STATIC_TOKENS } from "@/lib/tokens";
import type { TrendingToken } from "@/lib/types";

interface State {
  tokens: TrendingToken[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: number | null;
}

const REFRESH_MS = 30_000;

/**
 * Live-market data for a fixed list of SPL token mints. Defaults to the
 * curated `STATIC_TOKENS` list. Refreshes every 30s while mounted.
 */
export function useMarketTokens(mints?: string[]): State {
  const targetMints = mints ?? STATIC_TOKENS.map((t) => t.address);
  const mintsKey = targetMints.join(",");
  const lastMintsRef = useRef(mintsKey);

  const [state, setState] = useState<State>({
    tokens: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    lastMintsRef.current = mintsKey;
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const stats = await fetchDexScreenerTokens(
          mintsKey.split(","),
          controller.signal,
        );
        if (cancelled) return;

        const tokens: TrendingToken[] = mintsKey
          .split(",")
          .map((mint) => {
            const live = stats.get(mint);
            const meta = STATIC_TOKENS.find((t) => t.address === mint);
            if (!live) return null;
            return mergeTokens(mint, meta, live);
          })
          .filter((t): t is TrendingToken => t !== null);

        setState({
          tokens,
          isLoading: false,
          error: null,
          lastUpdated: Date.now(),
        });
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          isLoading: false,
          error: e instanceof Error ? e : new Error(String(e)),
        }));
      }
    }

    setState((s) => ({ ...s, isLoading: true }));
    load();
    const interval = window.setInterval(load, REFRESH_MS);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(interval);
    };
  }, [mintsKey]);

  return state;
}

function mergeTokens(
  mint: string,
  meta: { symbol: string; name: string; logoURI?: string } | undefined,
  live: LiveTokenStats,
): TrendingToken {
  return {
    address: mint,
    symbol: meta?.symbol ?? live.symbol,
    name: meta?.name ?? live.name,
    price: live.priceUsd,
    change24h: live.change24h,
    volume24h: live.volume24h,
    marketCap: live.marketCap,
    liquidity: live.liquidityUsd,
    holders: live.txns24h, // we use 24h tx count as a proxy for "activity"
    spark: syntheticSparkline(live.priceUsd, live.change24h),
    logoURI: meta?.logoURI,
  };
}

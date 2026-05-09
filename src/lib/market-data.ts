"use client";

import { JUPITER_API_BASE } from "./constants";

/**
 * Free, public market-data clients used across the app.
 *
 *  - DexScreener  → per-token price / volume / liquidity / 24h change
 *  - Jupiter Price → fast price-only (sometimes faster than DexScreener)
 *  - CoinGecko    → global SOL stats (24h vol, market cap, dominance)
 *
 * No API keys required. We keep all calls client-side so we don't need
 * a backend.
 */

const DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex";
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

/* ------------------------------------------------------------------ */
/*  DexScreener                                                        */
/* ------------------------------------------------------------------ */

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  priceNative?: string;
  txns?: {
    h24?: { buys: number; sells: number };
  };
  volume?: { h24?: number; h6?: number; h1?: number };
  priceChange?: { h24?: number; h6?: number; h1?: number; m5?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
}

export interface LiveTokenStats {
  address: string;
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  liquidityUsd: number;
  marketCap: number;
  fdv: number;
  txns24h: number;
  pairAddress?: string;
  dexId?: string;
}

/**
 * DexScreener supports up to 30 mints per call:
 * `/latest/dex/tokens/{mint1,mint2,...,mint30}`. We pick the most-liquid
 * pair for each base token.
 */
export async function fetchDexScreenerTokens(
  mints: string[],
  signal?: AbortSignal,
): Promise<Map<string, LiveTokenStats>> {
  const map = new Map<string, LiveTokenStats>();
  if (mints.length === 0) return map;

  const chunks: string[][] = [];
  for (let i = 0; i < mints.length; i += 30) chunks.push(mints.slice(i, i + 30));

  await Promise.all(
    chunks.map(async (chunk) => {
      const url = `${DEXSCREENER_BASE}/tokens/${chunk.join(",")}`;
      const res = await fetch(url, { signal, cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { pairs?: DexScreenerPair[] | null };
      const pairs = json.pairs ?? [];

      for (const mint of chunk) {
        const candidates = pairs.filter(
          (p) =>
            p.chainId === "solana" &&
            p.baseToken.address === mint &&
            p.priceUsd,
        );
        if (candidates.length === 0) continue;
        candidates.sort(
          (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0),
        );
        const top = candidates[0];
        const txns =
          (top.txns?.h24?.buys ?? 0) + (top.txns?.h24?.sells ?? 0);
        map.set(mint, {
          address: mint,
          symbol: top.baseToken.symbol,
          name: top.baseToken.name,
          priceUsd: Number(top.priceUsd) || 0,
          change24h: top.priceChange?.h24 ?? 0,
          volume24h: top.volume?.h24 ?? 0,
          liquidityUsd: top.liquidity?.usd ?? 0,
          marketCap: top.marketCap ?? top.fdv ?? 0,
          fdv: top.fdv ?? 0,
          txns24h: txns,
          pairAddress: top.pairAddress,
          dexId: top.dexId,
        });
      }
    }),
  );

  return map;
}

/**
 * DexScreener "search" endpoint — returns pairs ranked by trending /
 * activity. Useful for trending / hot-pairs UI without us hardcoding a list.
 */
export interface DexScreenerSearchResult {
  pairs: DexScreenerPair[];
}

export async function fetchDexScreenerSearch(
  query: string,
  signal?: AbortSignal,
): Promise<DexScreenerPair[]> {
  const url = `${DEXSCREENER_BASE}/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) return [];
  const json = (await res.json()) as DexScreenerSearchResult;
  return (json.pairs ?? []).filter((p) => p.chainId === "solana");
}

/* ------------------------------------------------------------------ */
/*  Jupiter Price API                                                   */
/* ------------------------------------------------------------------ */

interface JupiterPriceResponse {
  [mint: string]: { id: string; type: string; price: string } | null;
}

/**
 * Fast, price-only endpoint. Useful when we only need a USD price
 * (e.g. portfolio valuation) without the full DexScreener payload.
 */
export async function fetchJupiterPrices(
  mints: string[],
  signal?: AbortSignal,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (mints.length === 0) return map;

  const chunks: string[][] = [];
  for (let i = 0; i < mints.length; i += 100)
    chunks.push(mints.slice(i, i + 100));

  await Promise.all(
    chunks.map(async (chunk) => {
      const url = `${JUPITER_API_BASE}/price/v3?ids=${chunk.join(",")}`;
      const res = await fetch(url, { signal, cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as JupiterPriceResponse;
      for (const [mint, info] of Object.entries(json)) {
        if (info?.price) map.set(mint, Number(info.price));
      }
    }),
  );

  return map;
}

/* ------------------------------------------------------------------ */
/*  CoinGecko global SOL stats                                          */
/* ------------------------------------------------------------------ */

export interface SolanaGlobalStats {
  priceUsd: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export interface MarketChartPoint {
  t: number;
  v: number;
}

/**
 * 24h SOL price chart (5-min granularity) — used for the homepage
 * "Market pulse" widget.
 */
export async function fetchSolanaPriceChart(
  signal?: AbortSignal,
): Promise<MarketChartPoint[]> {
  const url = `${COINGECKO_BASE}/coins/solana/market_chart?vs_currency=usd&days=1`;
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) return [];
  const json = (await res.json()) as { prices: Array<[number, number]> };
  return (json.prices ?? []).map(([t, v]) => ({ t, v }));
}

export async function fetchSolanaGlobalStats(
  signal?: AbortSignal,
): Promise<SolanaGlobalStats | null> {
  const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=solana&price_change_percentage=24h`;
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as Array<{
    current_price: number;
    price_change_percentage_24h: number;
    total_volume: number;
    market_cap: number;
  }>;
  const sol = json[0];
  if (!sol) return null;
  return {
    priceUsd: sol.current_price,
    change24h: sol.price_change_percentage_24h ?? 0,
    volume24h: sol.total_volume,
    marketCap: sol.market_cap,
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Build a synthetic 24-point sparkline from the latest price + 24h change.
 * DexScreener doesn't expose a free OHLC endpoint, so we approximate with
 * a smooth curve from "open" → current price. This is purely cosmetic.
 */
export function syntheticSparkline(
  currentPrice: number,
  change24h: number,
  points = 24,
): number[] {
  if (currentPrice <= 0) return [];
  const open = currentPrice / (1 + change24h / 100);
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const ratio = i / (points - 1);
    const eased = ratio * ratio * (3 - 2 * ratio); // smoothstep
    const noise = Math.sin(i * 0.9) * 0.005 + Math.sin(i * 0.31) * 0.003;
    const v = open + (currentPrice - open) * eased;
    out.push(Math.max(0, v * (1 + noise)));
  }
  return out;
}

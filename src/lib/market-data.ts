"use client";

import { JUPITER_API_BASE, SOLANA_RPC } from "./constants";

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

/* ------------------------------------------------------------------ */
/*  Extended DexScreener helpers                                        */
/* ------------------------------------------------------------------ */

/**
 * Returns all Solana pairs for a given base mint, sorted by liquidity desc.
 * Used by holder distribution, whale activity, and rug-risk surfaces.
 */
export async function fetchDexScreenerPairsByMint(
  mint: string,
  signal?: AbortSignal,
): Promise<DexScreenerPair[]> {
  const url = `${DEXSCREENER_BASE}/tokens/${mint}`;
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) return [];
  const json = (await res.json()) as { pairs?: DexScreenerPair[] | null };
  const pairs = (json.pairs ?? []).filter(
    (p) => p.chainId === "solana" && p.baseToken.address === mint,
  );
  pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
  return pairs;
}

export interface DexAggregate {
  dexId: string;
  volume24h: number;
  liquidity: number;
  pairCount: number;
}

/**
 * Group pairs by DEX (raydium / orca / phoenix / meteora / lifinity / …).
 * Used by the Volume Tracker page and routing widgets.
 */
export function aggregateByDex(pairs: DexScreenerPair[]): DexAggregate[] {
  const map = new Map<string, DexAggregate>();
  for (const p of pairs) {
    const dex = p.dexId || "unknown";
    const cur = map.get(dex) ?? {
      dexId: dex,
      volume24h: 0,
      liquidity: 0,
      pairCount: 0,
    };
    cur.volume24h += p.volume?.h24 ?? 0;
    cur.liquidity += p.liquidity?.usd ?? 0;
    cur.pairCount += 1;
    map.set(dex, cur);
  }
  return [...map.values()].sort((a, b) => b.volume24h - a.volume24h);
}

/**
 * Convenience: fetch many mints, return the FULL flat pair list (instead
 * of one-pair-per-mint). Used for ecosystem heatmap + DEX share aggregation.
 */
export async function fetchAllPairsForMints(
  mints: string[],
  signal?: AbortSignal,
): Promise<DexScreenerPair[]> {
  if (mints.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < mints.length; i += 30) chunks.push(mints.slice(i, i + 30));

  const all: DexScreenerPair[] = [];
  await Promise.all(
    chunks.map(async (chunk) => {
      const url = `${DEXSCREENER_BASE}/tokens/${chunk.join(",")}`;
      const res = await fetch(url, { signal, cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { pairs?: DexScreenerPair[] | null };
      for (const p of json.pairs ?? []) {
        if (p.chainId === "solana") all.push(p);
      }
    }),
  );
  return all;
}

/* ------------------------------------------------------------------ */
/*  Solana RPC                                                          */
/* ------------------------------------------------------------------ */

interface RpcResp<T> {
  jsonrpc: "2.0";
  id: number;
  result: T;
  error?: { code: number; message: string };
}

let RPC_ID = 0;

async function rpc<T>(
  method: string,
  params: unknown[],
  signal?: AbortSignal,
): Promise<T | null> {
  RPC_ID += 1;
  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: RPC_ID,
      method,
      params,
    }),
    signal,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as RpcResp<T>;
  if (json.error) return null;
  return json.result ?? null;
}

export interface AccountSnapshot {
  exists: boolean;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
  dataLen: number;
}

export async function fetchAccountSnapshot(
  address: string,
  signal?: AbortSignal,
): Promise<AccountSnapshot | null> {
  const result = await rpc<{
    value:
      | {
          lamports: number;
          owner: string;
          executable: boolean;
          rentEpoch: number;
          data: [string, string];
        }
      | null;
  }>("getAccountInfo", [address, { encoding: "base64" }], signal);
  if (!result) return null;
  const v = result.value;
  if (!v) {
    return {
      exists: false,
      lamports: 0,
      owner: "",
      executable: false,
      rentEpoch: 0,
      dataLen: 0,
    };
  }
  let dataLen = 0;
  if (Array.isArray(v.data) && typeof v.data[0] === "string") {
    try {
      dataLen = atob(v.data[0]).length;
    } catch {
      dataLen = 0;
    }
  }
  return {
    exists: true,
    lamports: v.lamports,
    owner: v.owner,
    executable: v.executable,
    rentEpoch: v.rentEpoch,
    dataLen,
  };
}

export interface MintInfo {
  decimals: number;
  supply: string;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  isInitialized: boolean;
}

export async function fetchMintInfo(
  mint: string,
  signal?: AbortSignal,
): Promise<MintInfo | null> {
  type ParsedMint = {
    value: {
      data: {
        parsed: {
          info: {
            decimals: number;
            supply: string;
            mintAuthority: string | null;
            freezeAuthority: string | null;
            isInitialized: boolean;
          };
          type: string;
        };
      };
    } | null;
  };
  const result = await rpc<ParsedMint>(
    "getAccountInfo",
    [mint, { encoding: "jsonParsed" }],
    signal,
  );
  if (!result?.value) return null;
  const info = result.value.data.parsed.info;
  return {
    decimals: info.decimals,
    supply: info.supply,
    mintAuthority: info.mintAuthority,
    freezeAuthority: info.freezeAuthority,
    isInitialized: info.isInitialized,
  };
}

export interface RpcSignature {
  signature: string;
  slot: number;
  err: unknown | null;
  blockTime: number | null;
  memo?: string | null;
}

export async function fetchSignaturesForAddress(
  address: string,
  limit = 25,
  signal?: AbortSignal,
): Promise<RpcSignature[]> {
  const result = await rpc<RpcSignature[]>(
    "getSignaturesForAddress",
    [address, { limit }],
    signal,
  );
  return result ?? [];
}

export interface TokenLargestAccount {
  address: string;
  amount: string;
  decimals: number;
  uiAmount: number;
}

export async function fetchTokenLargestAccounts(
  mint: string,
  signal?: AbortSignal,
): Promise<TokenLargestAccount[]> {
  type Resp = {
    value: Array<{
      address: string;
      amount: string;
      decimals: number;
      uiAmount: number | null;
    }>;
  };
  const result = await rpc<Resp>("getTokenLargestAccounts", [mint], signal);
  if (!result?.value) return [];
  return result.value.map((v) => ({
    address: v.address,
    amount: v.amount,
    decimals: v.decimals,
    uiAmount: v.uiAmount ?? 0,
  }));
}

export async function fetchTokenSupply(
  mint: string,
  signal?: AbortSignal,
): Promise<{ uiAmount: number; decimals: number } | null> {
  type Resp = {
    value: { amount: string; decimals: number; uiAmount: number | null };
  };
  const result = await rpc<Resp>("getTokenSupply", [mint], signal);
  if (!result?.value) return null;
  return {
    uiAmount: result.value.uiAmount ?? 0,
    decimals: result.value.decimals,
  };
}

export interface ParsedTokenAccount {
  address: string;
  owner: string;
  mint: string;
  uiAmount: number;
}

/**
 * Resolve the wallet owner for a list of token-account addresses using a
 * single `getMultipleAccounts` RPC call. Returns null entries for accounts
 * that don't exist or aren't SPL token accounts.
 */
export async function fetchTokenAccountOwners(
  addresses: string[],
  signal?: AbortSignal,
): Promise<Array<ParsedTokenAccount | null>> {
  if (addresses.length === 0) return [];
  type Resp = {
    value: Array<
      | {
          owner: string;
          data: {
            parsed?: {
              info?: {
                owner?: string;
                mint?: string;
                tokenAmount?: { uiAmount: number | null };
              };
              type?: string;
            };
            program?: string;
          };
        }
      | null
    >;
  };
  const result = await rpc<Resp>(
    "getMultipleAccounts",
    [addresses, { encoding: "jsonParsed" }],
    signal,
  );
  if (!result?.value) return addresses.map(() => null);
  return result.value.map((entry, i) => {
    if (!entry) return null;
    const parsed = entry.data.parsed?.info;
    if (!parsed?.owner || !parsed.mint) return null;
    return {
      address: addresses[i],
      owner: parsed.owner,
      mint: parsed.mint,
      uiAmount: parsed.tokenAmount?.uiAmount ?? 0,
    };
  });
}

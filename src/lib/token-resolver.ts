import type { Token } from "./types";
import { findToken } from "./tokens";
import { fetchOnChainMintInfo, fetchMetaplexMetadata } from "./onchain-token";

/**
 * Solana mint addresses are base58-encoded ed25519 public keys, between 32 and
 * 44 characters. Base58 forbids the visually ambiguous characters `0`, `O`,
 * `I`, and `l`.
 */
const SOL_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/**
 * Anything that *looks* like an address-shaped paste — 32–44 alphanumeric
 * characters. Used to trigger the resolve banner even when the input violates
 * strict base58 (so the UI can tell the user *why* it can't resolve).
 */
const SOL_ADDRESS_LOOSE_RE = /^[A-Za-z0-9]{32,44}$/;

export function looksLikeSolanaAddress(input: string): boolean {
  return SOL_ADDRESS_RE.test(input.trim());
}

export function looksLikeAddressInput(input: string): boolean {
  return SOL_ADDRESS_LOOSE_RE.test(input.trim());
}

export type ResolveSource =
  | "static"
  | "jupiter"
  | "dexscreener"
  | "onchain";

export interface ResolvedTokenMeta extends Token {
  /** USD price at lookup time, if a price feed knew about it. */
  usdPrice?: number;
  /** Approx. holder count from Jupiter token graph. */
  holderCount?: number;
  /** Liquidity in USD (sum across pools we could see). */
  liquidityUsd?: number;
  /** Organic score 0..1 — higher = less spammy. */
  organicScore?: number;
  /** Where the metadata came from. */
  source: ResolveSource;
  /**
   * True only when metadata came from the curated Jupiter graph or the
   * built-in static list. Anything resolved via DexScreener or on-chain reads
   * is flagged false so the UI can warn.
   */
  verified: boolean;
}

export type ResolveFailureReason =
  | "invalid-format"
  | "not-a-token"
  | "not-found"
  | "network-error";

export interface ResolveFailure {
  reason: ResolveFailureReason;
  /** Owner program of the on-chain account, when relevant (`not-a-token`). */
  owner?: string;
  /** Free-form short message the UI can show. */
  message: string;
}

export type ResolveOutcome =
  | { ok: true; token: ResolvedTokenMeta }
  | { ok: false; failure: ResolveFailure };

interface JupiterV2SearchEntry {
  id: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  icon?: string;
  usdPrice?: number;
  holderCount?: number;
  liquidity?: number;
  organicScore?: number;
  tokenProgram?: string;
}

const JUP_TOKEN_SEARCH = "https://lite-api.jup.ag/tokens/v2/search";
const DEXSCREENER_TOKEN = "https://api.dexscreener.com/latest/dex/tokens";

/**
 * Resolve token metadata for a given mint. Tries (in order): static list,
 * Jupiter v2 search (curated graph), DexScreener pair-derived metadata, and
 * finally on-chain reads (mint + Metaplex metadata PDA). Returns the first
 * source that recognized the mint with verifiable metadata.
 */
export async function resolveTokenByMint(
  mint: string,
  signal?: AbortSignal,
): Promise<ResolvedTokenMeta | null> {
  const result = await resolveTokenWithDiagnostics(mint, signal);
  return result.ok ? result.token : null;
}

/**
 * Same as `resolveTokenByMint`, but returns a discriminated outcome with a
 * failure reason instead of `null`. The `TokenSelect` UI uses this so it can
 * say "this looks like a pool/program account, not a token" instead of the
 * old generic "not recognized" copy.
 */
export async function resolveTokenWithDiagnostics(
  mint: string,
  signal?: AbortSignal,
): Promise<ResolveOutcome> {
  const trimmed = mint.trim();
  if (!looksLikeSolanaAddress(trimmed)) {
    if (looksLikeAddressInput(trimmed)) {
      const bad = trimmed.match(/[0OIl]/g);
      const detail = bad
        ? ` Spotted character${bad.length > 1 ? "s" : ""} that base58 doesn't allow: ${[...new Set(bad)].join(", ")}.`
        : "";
      return {
        ok: false,
        failure: {
          reason: "invalid-format",
          message: `That looks like an address, but it isn't valid base58.${detail} Solana mints are case-sensitive — recopy the original (likely mixed-case) value.`,
        },
      };
    }
    return {
      ok: false,
      failure: {
        reason: "invalid-format",
        message: "Not a valid Solana address",
      },
    };
  }

  const fromStatic = findToken(trimmed);
  if (fromStatic) {
    return {
      ok: true,
      token: { ...fromStatic, source: "static", verified: true },
    };
  }

  const fromJupiter = await tryJupiterV2(trimmed, signal);
  if (fromJupiter) return { ok: true, token: fromJupiter };

  // DexScreener + on-chain mint info answer different questions
  // (price/liquidity vs decimals + owner). Run them in parallel so the
  // wait time is bounded by the slower of the two, not their sum.
  const [fromDex, mintInfo] = await Promise.all([
    tryDexScreener(trimmed, signal),
    fetchOnChainMintInfo(trimmed, signal).catch(() => null),
  ]);

  if (mintInfo && !mintInfo.isToken) {
    return {
      ok: false,
      failure: {
        reason: "not-a-token",
        owner: mintInfo.owner,
        message:
          "This address is owned by a non-token program. Looks like a pool, vault, or program account — not a token mint.",
      },
    };
  }

  if (mintInfo) {
    const meta = await fetchMetaplexMetadata(trimmed, signal).catch(() => null);
    const symbol =
      meta?.symbol ||
      fromDex?.symbol ||
      `${trimmed.slice(0, 4).toUpperCase()}…${trimmed.slice(-4).toUpperCase()}`;
    const name = meta?.name || fromDex?.name || symbol;
    const icon = fromDex?.logoURI || meta?.image;

    return {
      ok: true,
      token: {
        address: trimmed,
        symbol,
        name,
        decimals: mintInfo.decimals,
        logoURI: icon,
        tags: ["pasted"],
        usdPrice: fromDex?.usdPrice,
        liquidityUsd: fromDex?.liquidityUsd,
        organicScore: undefined,
        holderCount: undefined,
        source: meta || !fromDex ? "onchain" : "dexscreener",
        verified: false,
      },
    };
  }

  if (fromDex) {
    return { ok: true, token: fromDex };
  }

  return {
    ok: false,
    failure: {
      reason: "not-found",
      message:
        "Couldn't find this mint on Jupiter, DexScreener, or the Solana RPC. Double-check the address.",
    },
  };
}

async function tryJupiterV2(
  mint: string,
  signal?: AbortSignal,
): Promise<ResolvedTokenMeta | null> {
  try {
    const url = new URL(JUP_TOKEN_SEARCH);
    url.searchParams.set("query", mint);
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as JupiterV2SearchEntry[] | null;
    if (!Array.isArray(data) || data.length === 0) return null;
    // Jupiter v2 search is fuzzy text matching, so the response may include
    // unrelated tokens that share substrings with the mint. Only accept an
    // exact id match.
    const entry = data.find((d) => d.id === mint);
    if (!entry || typeof entry.symbol !== "string" || typeof entry.decimals !== "number") {
      return null;
    }
    return {
      address: entry.id,
      symbol: entry.symbol,
      name: entry.name ?? entry.symbol,
      decimals: entry.decimals,
      logoURI: entry.icon,
      tags: ["pasted"],
      usdPrice: entry.usdPrice,
      holderCount: entry.holderCount,
      liquidityUsd: entry.liquidity,
      organicScore: entry.organicScore,
      source: "jupiter",
      verified: true,
    };
  } catch {
    return null;
  }
}

interface DexScreenerPair {
  baseToken?: { address: string; name: string; symbol: string };
  quoteToken?: { address: string; name: string; symbol: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
  info?: { imageUrl?: string };
}

interface DexScreenerResponse {
  pairs: DexScreenerPair[] | null;
}

async function tryDexScreener(
  mint: string,
  signal?: AbortSignal,
): Promise<ResolvedTokenMeta | null> {
  try {
    const res = await fetch(`${DEXSCREENER_TOKEN}/${mint}`, {
      headers: { Accept: "application/json" },
      signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as DexScreenerResponse;
    const pairs = Array.isArray(data.pairs) ? data.pairs : [];
    if (pairs.length === 0) return null;

    let symbol: string | undefined;
    let name: string | undefined;
    let liquidityUsd = 0;
    let priceUsd: number | undefined;
    let icon: string | undefined;

    for (const p of pairs) {
      const base = p.baseToken;
      const quote = p.quoteToken;
      const isBase = base?.address === mint;
      const isQuote = quote?.address === mint;
      if (!isBase && !isQuote) continue;
      if (isBase && base) {
        symbol = symbol ?? base.symbol;
        name = name ?? base.name;
      } else if (isQuote && quote) {
        symbol = symbol ?? quote.symbol;
        name = name ?? quote.name;
      }
      if (typeof p.liquidity?.usd === "number") {
        liquidityUsd += p.liquidity.usd;
      }
      if (priceUsd === undefined && typeof p.priceUsd === "string") {
        const v = Number.parseFloat(p.priceUsd);
        if (Number.isFinite(v)) priceUsd = v;
      }
      if (!icon && p.info?.imageUrl) {
        icon = p.info.imageUrl;
      }
    }

    if (!symbol) return null;
    return {
      address: mint,
      symbol,
      name: name ?? symbol,
      // DexScreener doesn't expose decimals — caller overlays from on-chain.
      decimals: 0,
      logoURI: icon,
      tags: ["pasted"],
      usdPrice: priceUsd,
      liquidityUsd: liquidityUsd > 0 ? liquidityUsd : undefined,
      source: "dexscreener",
      verified: false,
    };
  } catch {
    return null;
  }
}

/**
 * Search Jupiter token graph by free-form query (symbol, name, or mint).
 * Returns up to `limit` tokens. Used to power the TokenSelect search box.
 */
export async function searchJupiterTokens(
  query: string,
  limit = 10,
  signal?: AbortSignal,
): Promise<ResolvedTokenMeta[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const url = new URL(JUP_TOKEN_SEARCH);
    url.searchParams.set("query", q);
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal,
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as JupiterV2SearchEntry[] | null;
    if (!Array.isArray(data)) return [];
    const out: ResolvedTokenMeta[] = [];
    for (const entry of data.slice(0, limit)) {
      if (
        typeof entry.id !== "string" ||
        typeof entry.symbol !== "string" ||
        typeof entry.decimals !== "number"
      ) {
        continue;
      }
      out.push({
        address: entry.id,
        symbol: entry.symbol,
        name: entry.name ?? entry.symbol,
        decimals: entry.decimals,
        logoURI: entry.icon,
        tags: ["pasted"],
        usdPrice: entry.usdPrice,
        holderCount: entry.holderCount,
        liquidityUsd: entry.liquidity,
        organicScore: entry.organicScore,
        source: "jupiter",
        verified: true,
      });
    }
    return out;
  } catch {
    return [];
  }
}

import type { Token } from "./types";
import { findToken } from "./tokens";

/**
 * Solana mint addresses are base58 encoded ed25519 public keys, between 32 and
 * 44 characters in practice. Strict regex avoids false-positives on partial
 * symbol input.
 */
const SOL_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function looksLikeSolanaAddress(input: string): boolean {
  return SOL_ADDRESS_RE.test(input.trim());
}

export interface ResolvedTokenMeta extends Token {
  /** USD price at lookup time, if Jupiter knew about it. */
  usdPrice?: number;
  /** Approx. holder count from Jupiter token graph. */
  holderCount?: number;
  /** Liquidity in USD (sum across pools Jupiter knows about). */
  liquidityUsd?: number;
  /** Organic score 0..1 — higher = less spammy. */
  organicScore?: number;
  /**
   * True when the resolver pulled metadata from a trusted on-chain source
   * (Jupiter token graph). Pasted addresses that *only* came back from RPC
   * `getMint` are flagged false so the UI can warn.
   */
  verified: boolean;
}

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

/**
 * Resolve token metadata for a given mint. Tries Jupiter v2 search first
 * (rich metadata + price). Returns null when no source recognized the mint.
 */
export async function resolveTokenByMint(
  mint: string,
  signal?: AbortSignal,
): Promise<ResolvedTokenMeta | null> {
  if (!looksLikeSolanaAddress(mint)) return null;

  const fromStatic = findToken(mint);
  if (fromStatic) {
    return { ...fromStatic, verified: true };
  }

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
    const entry = data.find((d) => d.id === mint) ?? data[0];
    if (!entry || entry.id !== mint) return null;
    if (
      typeof entry.symbol !== "string" ||
      typeof entry.decimals !== "number"
    ) {
      return null;
    }
    const token: ResolvedTokenMeta = {
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
      verified: true,
    };
    return token;
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
        verified: true,
      });
    }
    return out;
  } catch {
    return [];
  }
}

"use client";

import { useEffect, useMemo } from "react";
import { findToken } from "@/lib/tokens";
import { useTokenStore } from "@/store/token-store";
import { resolveTokenByMint, looksLikeSolanaAddress } from "@/lib/token-resolver";
import type { Token } from "@/lib/types";

/**
 * Returns the merged Token entry for a mint — preferring the static token list,
 * then any dynamically resolved tokens stored in the Zustand store. If the
 * mint is well-formed but unknown, kicks off a resolver fetch which then
 * appears here once the store updates.
 */
export function useToken(address: string | null | undefined): Token | undefined {
  const dynamic = useTokenStore((s) =>
    address ? s.tokens[address] : undefined,
  );
  const addToken = useTokenStore((s) => s.addToken);

  const fromStatic = address ? findToken(address) : undefined;
  const merged = fromStatic ?? dynamic;

  useEffect(() => {
    if (merged) return;
    if (!address || !looksLikeSolanaAddress(address)) return;
    let cancelled = false;
    (async () => {
      const t = await resolveTokenByMint(address);
      if (cancelled || !t) return;
      addToken(t);
    })();
    return () => {
      cancelled = true;
    };
  }, [address, merged, addToken]);

  return merged;
}

/**
 * Reactive bulk lookup: returns a function `(mint) => Token | undefined` that
 * checks the static list and the dynamic store. Useful inside `.map()` rows
 * (which can't call hooks per row). Recomputes when the dynamic store updates.
 */
export function useTokenLookup(): (mint: string) => Token | undefined {
  const dynamicTokens = useTokenStore((s) => s.tokens);
  return useMemo(
    () => (mint: string) => findToken(mint) ?? dynamicTokens[mint],
    [dynamicTokens],
  );
}

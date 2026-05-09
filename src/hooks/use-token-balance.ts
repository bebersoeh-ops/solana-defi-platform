"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SOL_MINT } from "@/lib/constants";

interface TokenBalanceState {
  /** UI amount (already divided by 10^decimals). 0 if not loaded. */
  amount: number;
  /** True while the first/refresh fetch is in flight. */
  loading: boolean;
  /** True after the first successful fetch (so we know amount is fresh). */
  hasLoaded: boolean;
  error: string | null;
}

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
const REFRESH_MS = 30_000;

/**
 * Live wallet balance for a single SPL mint (or native SOL when mint is the
 * SOL_MINT). Returns 0 with hasLoaded=true when the wallet has no token
 * account for that mint — distinct from `loading`, so callers can render
 * "Insufficient balance" instead of "Loading…".
 */
export function useTokenBalance(mint: string | null | undefined): TokenBalanceState {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [state, setState] = useState<TokenBalanceState>({
    amount: 0,
    loading: false,
    hasLoaded: false,
    error: null,
  });

  useEffect(() => {
    if (!publicKey || !connected || !mint) {
      setState({ amount: 0, loading: false, hasLoaded: false, error: null });
      return;
    }

    let cancelled = false;
    const owner = publicKey;
    const conn = connection;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        let amount = 0;
        if (mint === SOL_MINT) {
          const lamports = await conn.getBalance(owner, "confirmed");
          amount = lamports / LAMPORTS_PER_SOL;
        } else {
          const resp = await conn.getParsedTokenAccountsByOwner(owner, {
            mint: new PublicKey(mint as string),
          });
          for (const acc of resp.value) {
            type Parsed = {
              parsed: {
                info: {
                  tokenAmount: { uiAmount: number | null };
                };
              };
            };
            const data = acc.account.data as unknown as Parsed;
            amount += data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
          }
        }
        if (cancelled) return;
        setState({ amount, loading: false, hasLoaded: true, error: null });
      } catch (e) {
        if (cancelled) return;
        setState({
          amount: 0,
          loading: false,
          hasLoaded: true,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    load();
    const interval = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [publicKey, connected, connection, mint]);

  return state;
}

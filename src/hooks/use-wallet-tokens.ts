"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { fetchJupiterPrices, fetchDexScreenerTokens } from "@/lib/market-data";
import { SOL_MINT } from "@/lib/constants";
import { findToken } from "@/lib/tokens";
import type { PortfolioAsset } from "@/lib/types";

interface State {
  assets: PortfolioAsset[];
  totalValue: number;
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
  lastUpdated: number | null;
}

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
const REFRESH_MS = 60_000;

/**
 * Real-time SPL balances + prices for the connected wallet. Falls back to
 * empty state when no wallet is connected — UIs should show their own
 * placeholder.
 */
export function useWalletTokens(): State {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [state, setState] = useState<State>({
    assets: [],
    totalValue: 0,
    isLoading: false,
    error: null,
    isConnected: false,
    lastUpdated: null,
  });

  useEffect(() => {
    if (!publicKey || !connected) {
      setState({
        assets: [],
        totalValue: 0,
        isLoading: false,
        error: null,
        isConnected: false,
        lastUpdated: null,
      });
      return;
    }

    let cancelled = false;
    const owner = publicKey;
    const connectionRef = connection;

    async function load() {
      setState((s) => ({ ...s, isLoading: true, isConnected: true }));
      try {
        const [solBalanceLamports, parsed] = await Promise.all([
          connectionRef.getBalance(owner),
          connectionRef.getParsedTokenAccountsByOwner(owner, {
            programId: TOKEN_PROGRAM_ID,
          }),
        ]);

        type ParsedTokenInfo = {
          mint: string;
          tokenAmount: { uiAmount: number | null; decimals: number };
        };
        type ParsedAccountData = {
          parsed: { info: ParsedTokenInfo };
        };

        const splHoldings = parsed.value
          .map((acc) => {
            const data = acc.account.data as unknown as ParsedAccountData;
            const info = data?.parsed?.info;
            if (!info) return null;
            const amount = info.tokenAmount.uiAmount ?? 0;
            if (amount <= 0) return null;
            return { mint: info.mint, amount };
          })
          .filter((x): x is { mint: string; amount: number } => x !== null);

        const solAmount = solBalanceLamports / LAMPORTS_PER_SOL;
        const allMints = [SOL_MINT, ...splHoldings.map((h) => h.mint)];

        const [prices, stats] = await Promise.all([
          fetchJupiterPrices(allMints),
          fetchDexScreenerTokens(allMints),
        ]);

        const all: Array<{
          mint: string;
          amount: number;
        }> = [
          { mint: SOL_MINT, amount: solAmount },
          ...splHoldings,
        ];

        const assetsRaw: PortfolioAsset[] = all
          .map(({ mint, amount }) => {
            const price = prices.get(mint) ?? stats.get(mint)?.priceUsd ?? 0;
            const meta = findToken(mint);
            const change24h = stats.get(mint)?.change24h ?? 0;
            const value = amount * price;
            const live = stats.get(mint);
            return {
              address: mint,
              symbol: meta?.symbol ?? live?.symbol ?? "?",
              name: meta?.name ?? live?.name ?? "Unknown token",
              amount,
              balance: amount,
              price,
              value,
              change24h,
              allocation: 0,
              logoURI: meta?.logoURI,
            };
          })
          .filter((a) => a.value > 0 || a.address === SOL_MINT)
          .sort((a, b) => b.value - a.value);

        const totalValue = assetsRaw.reduce((sum, a) => sum + a.value, 0);
        const assets = assetsRaw.map((a) => ({
          ...a,
          allocation: totalValue > 0 ? (a.value / totalValue) * 100 : 0,
        }));

        if (cancelled) return;
        setState({
          assets,
          totalValue,
          isLoading: false,
          error: null,
          isConnected: true,
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

    load();
    const interval = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [publicKey, connected, connection]);

  return state;
}

"use client";

import { useEffect, useState } from "react";
import { getQuote } from "@/lib/jupiter";
import type { JupiterQuoteResponse } from "@/lib/types";

interface QuoteHookParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  inputDecimals: number;
  slippageBps: number;
  enabled?: boolean;
  refreshMs?: number;
}

export function useJupiterQuote({
  inputMint,
  outputMint,
  amount,
  inputDecimals,
  slippageBps,
  enabled = true,
  refreshMs = 12_000,
}: QuoteHookParams) {
  const [quote, setQuote] = useState<JupiterQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [age, setAge] = useState<number>(0);

  useEffect(() => {
    if (!enabled) return;
    if (!amount || amount <= 0) {
      setQuote(null);
      setError(null);
      return;
    }
    if (inputMint === outputMint) {
      setQuote(null);
      setError(null);
      return;
    }
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const lamports = BigInt(Math.floor(amount * Math.pow(10, inputDecimals)));
        const q = await getQuote({
          inputMint,
          outputMint,
          amount: lamports.toString(),
          slippageBps,
        });
        if (!cancelled) {
          setQuote(q);
          setAge(Date.now());
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setQuote(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    intervalId = setInterval(run, refreshMs);
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [inputMint, outputMint, amount, inputDecimals, slippageBps, enabled, refreshMs]);

  return { quote, loading, error, age };
}

"use client";

import { useEffect, useState } from "react";
import {
  fetchSolanaGlobalStats,
  type SolanaGlobalStats,
} from "@/lib/market-data";

interface State {
  stats: SolanaGlobalStats | null;
  isLoading: boolean;
  error: Error | null;
}

const REFRESH_MS = 60_000;

export function useSolanaStats(): State {
  const [state, setState] = useState<State>({
    stats: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const stats = await fetchSolanaGlobalStats(controller.signal);
        if (cancelled) return;
        setState({ stats, isLoading: false, error: null });
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
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return state;
}

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SOL_MINT, USDC_MINT, SLIPPAGE_PRESETS } from "@/lib/constants";
import type { SwapHistoryEntry } from "@/lib/types";

interface SwapState {
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  slippageBps: number;
  customSlippage: boolean;
  priorityFee: "auto" | "low" | "medium" | "high" | "veryHigh";
  expertMode: boolean;
  history: SwapHistoryEntry[];
  favorites: string[];
  recentTokens: string[];

  setInputMint: (mint: string) => void;
  setOutputMint: (mint: string) => void;
  setInputAmount: (amount: string) => void;
  setSlippageBps: (bps: number) => void;
  setCustomSlippage: (enabled: boolean) => void;
  setPriorityFee: (fee: SwapState["priorityFee"]) => void;
  setExpertMode: (enabled: boolean) => void;
  swapDirection: () => void;

  addHistory: (entry: SwapHistoryEntry) => void;
  updateHistory: (id: string, patch: Partial<SwapHistoryEntry>) => void;
  clearHistory: () => void;

  toggleFavorite: (mint: string) => void;
  pushRecent: (mint: string) => void;
}

export const useSwapStore = create<SwapState>()(
  persist(
    (set, get) => ({
      inputMint: SOL_MINT,
      outputMint: USDC_MINT,
      inputAmount: "",
      slippageBps: SLIPPAGE_PRESETS[1],
      customSlippage: false,
      priorityFee: "auto",
      expertMode: false,
      history: [],
      favorites: [SOL_MINT, USDC_MINT],
      recentTokens: [SOL_MINT, USDC_MINT],

      setInputMint: (m) => {
        set({ inputMint: m });
        get().pushRecent(m);
      },
      setOutputMint: (m) => {
        set({ outputMint: m });
        get().pushRecent(m);
      },
      setInputAmount: (a) => set({ inputAmount: a }),
      setSlippageBps: (b) => set({ slippageBps: b }),
      setCustomSlippage: (e) => set({ customSlippage: e }),
      setPriorityFee: (f) => set({ priorityFee: f }),
      setExpertMode: (e) => set({ expertMode: e }),

      swapDirection: () =>
        set((s) => ({
          inputMint: s.outputMint,
          outputMint: s.inputMint,
          inputAmount: "",
        })),

      addHistory: (entry) =>
        set((s) => ({ history: [entry, ...s.history].slice(0, 100) })),
      updateHistory: (id, patch) =>
        set((s) => ({
          history: s.history.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
      clearHistory: () => set({ history: [] }),

      toggleFavorite: (mint) =>
        set((s) => ({
          favorites: s.favorites.includes(mint)
            ? s.favorites.filter((m) => m !== mint)
            : [mint, ...s.favorites].slice(0, 30),
        })),

      pushRecent: (mint) =>
        set((s) => ({
          recentTokens: [mint, ...s.recentTokens.filter((m) => m !== mint)].slice(0, 12),
        })),
    }),
    {
      name: "lumen.swap.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        inputMint: s.inputMint,
        outputMint: s.outputMint,
        slippageBps: s.slippageBps,
        priorityFee: s.priorityFee,
        expertMode: s.expertMode,
        history: s.history,
        favorites: s.favorites,
        recentTokens: s.recentTokens,
      }),
    }
  )
);

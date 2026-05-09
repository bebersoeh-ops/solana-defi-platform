"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PortfolioState {
  trackedWallets: string[];
  primaryWallet: string | null;
  hideSmallBalances: boolean;
  privacyMode: boolean;

  addWallet: (address: string) => void;
  removeWallet: (address: string) => void;
  setPrimaryWallet: (address: string | null) => void;
  setHideSmallBalances: (v: boolean) => void;
  setPrivacyMode: (v: boolean) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      trackedWallets: [],
      primaryWallet: null,
      hideSmallBalances: false,
      privacyMode: false,

      addWallet: (address) =>
        set((s) => ({
          trackedWallets: s.trackedWallets.includes(address)
            ? s.trackedWallets
            : [...s.trackedWallets, address],
        })),
      removeWallet: (address) =>
        set((s) => ({
          trackedWallets: s.trackedWallets.filter((a) => a !== address),
          primaryWallet: s.primaryWallet === address ? null : s.primaryWallet,
        })),
      setPrimaryWallet: (address) => set({ primaryWallet: address }),
      setHideSmallBalances: (v) => set({ hideSmallBalances: v }),
      setPrivacyMode: (v) => set({ privacyMode: v }),
    }),
    {
      name: "lumen.portfolio.v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

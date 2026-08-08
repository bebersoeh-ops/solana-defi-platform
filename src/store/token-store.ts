"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Token } from "@/lib/types";

interface TokenStoreState {
  /** Resolved-on-the-fly tokens keyed by mint. */
  tokens: Record<string, Token>;
  /** Last seen timestamp per mint, used for LRU pruning. */
  lastSeen: Record<string, number>;

  addToken: (token: Token) => void;
  removeToken: (mint: string) => void;
  /** Touch (mark "last seen now") so the entry survives pruning. */
  touch: (mint: string) => void;
}

const MAX_DYNAMIC_TOKENS = 50;

export const useTokenStore = create<TokenStoreState>()(
  persist(
    (set) => ({
      tokens: {},
      lastSeen: {},

      addToken: (token) =>
        set((s) => {
          const next: Record<string, Token> = { ...s.tokens, [token.address]: token };
          const seen: Record<string, number> = {
            ...s.lastSeen,
            [token.address]: Date.now(),
          };
          // LRU prune.
          const keys = Object.keys(next);
          if (keys.length > MAX_DYNAMIC_TOKENS) {
            const sorted = keys.sort(
              (a, b) => (seen[a] ?? 0) - (seen[b] ?? 0),
            );
            const toRemove = sorted.slice(0, keys.length - MAX_DYNAMIC_TOKENS);
            for (const k of toRemove) {
              delete next[k];
              delete seen[k];
            }
          }
          return { tokens: next, lastSeen: seen };
        }),

      removeToken: (mint) =>
        set((s) => {
          const tokens = { ...s.tokens };
          const seen = { ...s.lastSeen };
          delete tokens[mint];
          delete seen[mint];
          return { tokens, lastSeen: seen };
        }),

      touch: (mint) =>
        set((s) => ({
          lastSeen: { ...s.lastSeen, [mint]: Date.now() },
        })),
    }),
    {
      name: "lumen.tokens.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { NotificationItem } from "@/lib/types";
import { getMockNotifications } from "@/lib/mock-data";

export type AccentTheme = "mint" | "purple" | "blue" | "pink" | "orange";

export interface NotificationPrefs {
  swap: boolean;
  wallet: boolean;
  insights: boolean;
  quiet: boolean;
}

interface UiState {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  notificationsOpen: boolean;
  watchlist: string[];
  notifications: NotificationItem[];
  theme: "dark" | "midnight" | "neo" | "matrix";
  reducedMotion: boolean;
  reduceMotion: boolean;
  accent: AccentTheme;
  compactMode: boolean;
  showGrid: boolean;
  notificationPrefs: NotificationPrefs;

  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setCommandOpen: (v: boolean) => void;
  setNotificationsOpen: (v: boolean) => void;
  toggleWatchlist: (mint: string) => void;
  pushNotification: (n: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  setTheme: (t: UiState["theme"]) => void;
  setReducedMotion: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setAccent: (a: AccentTheme) => void;
  setCompactMode: (v: boolean) => void;
  setShowGrid: (v: boolean) => void;
  setNotificationPrefs: (p: Partial<NotificationPrefs>) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandOpen: false,
      notificationsOpen: false,
      watchlist: [],
      notifications: getMockNotifications(),
      theme: "dark",
      reducedMotion: false,
      reduceMotion: false,
      accent: "mint",
      compactMode: false,
      showGrid: true,
      notificationPrefs: {
        swap: true,
        wallet: true,
        insights: false,
        quiet: false,
      },

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setCommandOpen: (v) => set({ commandOpen: v }),
      setNotificationsOpen: (v) => set({ notificationsOpen: v }),
      toggleWatchlist: (mint) =>
        set((s) => ({
          watchlist: s.watchlist.includes(mint)
            ? s.watchlist.filter((m) => m !== mint)
            : [mint, ...s.watchlist].slice(0, 50),
        })),
      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              id: Math.random().toString(36).slice(2),
              timestamp: Date.now(),
              read: false,
              ...n,
            },
            ...s.notifications,
          ].slice(0, 100),
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),
      setTheme: (t) => set({ theme: t }),
      setReducedMotion: (v) => set({ reducedMotion: v, reduceMotion: v }),
      setReduceMotion: (v) => set({ reduceMotion: v, reducedMotion: v }),
      setAccent: (a) => set({ accent: a }),
      setCompactMode: (v) => set({ compactMode: v }),
      setShowGrid: (v) => set({ showGrid: v }),
      setNotificationPrefs: (p) =>
        set((s) => ({ notificationPrefs: { ...s.notificationPrefs, ...p } })),
    }),
    {
      name: "lumen.ui.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        watchlist: s.watchlist,
        theme: s.theme,
        reducedMotion: s.reducedMotion,
        reduceMotion: s.reduceMotion,
        accent: s.accent,
        compactMode: s.compactMode,
        showGrid: s.showGrid,
        notificationPrefs: s.notificationPrefs,
      }),
    }
  )
);

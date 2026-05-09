"use client";

import { Bell, Command, Menu, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUiStore } from "@/store/ui-store";
import { MobileSheet } from "./mobile-sheet";
import { useState } from "react";
import { NotificationsDrawer } from "./notifications-drawer";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false, loading: () => <div className="h-9 w-32 rounded-md bg-white/5 animate-pulse" /> }
);

export function Topbar() {
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const notifications = useUiStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-white/[0.06] bg-[#0a0c12]/80 px-3 sm:px-5 py-2.5 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="flex h-9 flex-1 max-w-md items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 text-sm text-muted-foreground transition-colors hover:border-white/10 hover:bg-white/[0.04]"
        >
          <Search className="size-4" />
          <span className="truncate">Search tokens, wallets, routes…</span>
          <kbd className="ml-auto inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono">
            <Command className="size-3" />K
          </kbd>
        </button>

        <Badge variant="live" className="hidden sm:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Mainnet
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setNotifOpen(true)}
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 size-2 rounded-full bg-rose-400" />
          )}
        </Button>

        <div className="hidden sm:block">
          <WalletMultiButton
            style={{
              background: "transparent",
              border: "1px solid hsl(var(--primary)/0.4)",
              color: "hsl(var(--primary))",
              borderRadius: 10,
              height: 36,
              padding: "0 14px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              boxShadow: "0 8px 30px -16px hsl(var(--primary) / 0.6)",
            }}
          />
        </div>
      </header>

      <MobileSheet open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}

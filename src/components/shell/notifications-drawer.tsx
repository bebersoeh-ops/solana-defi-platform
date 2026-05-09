"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui-store";
import { cn, formatRelativeTime } from "@/lib/utils";

export function NotificationsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const notifications = useUiStore((s) => s.notifications);
  const markAllRead = useUiStore((s) => s.markAllRead);
  const clear = useUiStore((s) => s.clearNotifications);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 w-[380px] max-w-[92vw] bg-[#0a0c12]/95 backdrop-blur-xl border-l border-white/[0.06] flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04]">
              <span className="text-xs text-muted-foreground">
                {notifications.filter((n) => !n.read).length} unread
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={markAllRead}>
                  <Check className="size-3.5 mr-1" />
                  Mark all read
                </Button>
                <Button variant="ghost" size="sm" onClick={clear}>
                  <BellOff className="size-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => {
                  const colors: Record<string, string> = {
                    success: "border-emerald-500/30 bg-emerald-500/5",
                    info: "border-sky-500/30 bg-sky-500/5",
                    warning: "border-amber-500/30 bg-amber-500/5",
                    error: "border-rose-500/30 bg-rose-500/5",
                  };
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "rounded-lg border p-3 transition-colors",
                        colors[n.type],
                        !n.read && "ring-1 ring-white/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium">{n.title}</h4>
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeTime(n.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {n.description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

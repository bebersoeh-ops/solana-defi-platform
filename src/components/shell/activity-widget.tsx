"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber, formatRelativeTime, generateId } from "@/lib/utils";
import { getMockActivityFeed } from "@/lib/mock-data";
import type { ActivityEvent } from "@/lib/types";

export function ActivityWidget() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setEvents(getMockActivityFeed(8));
    const id = setInterval(() => {
      setEvents((current) => {
        const types: ActivityEvent["type"][] = ["swap", "swap", "transfer", "stake"];
        const tokens = ["SOL", "USDC", "JUP", "BONK", "WIF"];
        const newEvent: ActivityEvent = {
          id: generateId("evt"),
          type: types[Math.floor(Math.random() * types.length)],
          user: `${Math.random().toString(36).slice(2, 6)}…${Math.random()
            .toString(36)
            .slice(2, 6)}`,
          amount: Math.random() * 5000,
          token: tokens[Math.floor(Math.random() * tokens.length)],
          value: Math.random() * 50_000,
          timestamp: Date.now(),
        };
        return [newEvent, ...current].slice(0, 12);
      });
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden lg:flex fixed right-4 bottom-4 z-30 flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="w-80 rounded-xl glass-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium">Live activity</span>
                <Badge variant="live" className="text-[9px] py-0">REALTIME</Badge>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto no-scrollbar">
              <AnimatePresence initial={false}>
                {events.map((evt) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.2 }}
                    className="px-3 py-2 border-b border-white/[0.04] flex items-center gap-3"
                  >
                    <div
                      className={cn(
                        "size-2 rounded-full shrink-0",
                        evt.type === "swap"
                          ? "bg-primary"
                          : evt.type === "transfer"
                            ? "bg-sky-400"
                            : evt.type === "stake"
                              ? "bg-fuchsia-400"
                              : "bg-amber-400"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium capitalize">
                        {evt.type} • {evt.token}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">
                        {evt.user}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium">
                        ${formatNumber(evt.value, 0)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(evt.timestamp)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        variant="glass"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="shadow-2xl"
      >
        <Activity className="size-4 text-primary" />
        Live activity
        {open ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
      </Button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMockActivityFeed } from "@/lib/mock-data";
import { cn, formatNumber, formatRelativeTime, generateId } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { ActivityEvent } from "@/lib/types";

export function LiveActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setEvents(getMockActivityFeed(8));
    const id = setInterval(() => {
      setEvents((current) => {
        const types: ActivityEvent["type"][] = [
          "swap",
          "swap",
          "transfer",
          "stake",
          "mint",
        ];
        const tokens = ["SOL", "USDC", "JUP", "BONK", "WIF", "PYTH"];
        const e: ActivityEvent = {
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
        return [e, ...current].slice(0, 8);
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live activity</CardTitle>
          <Badge variant="live" className="text-[9px]">REAL-TIME</Badge>
        </div>
        <CardDescription>Recent on-chain flows · simulated demo feed</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-2 max-h-72 overflow-y-auto no-scrollbar">
        <AnimatePresence initial={false}>
          {events.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/[0.03]"
            >
              <div
                className={cn(
                  "size-7 rounded-full grid place-items-center text-[10px] font-medium uppercase",
                  evt.type === "swap"
                    ? "bg-primary/10 text-primary"
                    : evt.type === "transfer"
                      ? "bg-sky-500/10 text-sky-300"
                      : evt.type === "stake"
                        ? "bg-fuchsia-500/10 text-fuchsia-300"
                        : "bg-amber-500/10 text-amber-300"
                )}
              >
                {evt.type[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium">
                  <span className="capitalize">{evt.type}</span>{" "}
                  <span className="text-muted-foreground">·</span> {evt.token}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {evt.user}
                </div>
              </div>
              <div className="text-right">
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
      </CardContent>
    </Card>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, RotateCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSwapStore } from "@/store/swap-store";
import { useMounted } from "@/hooks/use-mounted";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export function SwapHistory() {
  const mounted = useMounted();
  const history = useSwapStore((s) => s.history);
  const clearHistory = useSwapStore((s) => s.clearHistory);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4" /> Recent swaps
            </CardTitle>
            <CardDescription>Your local swap history</CardDescription>
          </div>
          {history.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearHistory}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pt-0 pb-3">
        {!mounted ? null : history.length === 0 ? (
          <EmptyState
            icon={History}
            title="No swaps yet"
            description="Your recent transactions will appear here."
          />
        ) : (
          <ul className="space-y-1.5">
            <AnimatePresence>
              {history.slice(0, 8).map((h) => (
                <motion.li
                  key={h.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-medium">
                      {formatNumber(h.inAmount, 4)} {h.inputSymbol}{" "}
                      <span className="text-muted-foreground">→</span>{" "}
                      {formatNumber(h.outAmount, 4)} {h.outputSymbol}
                    </div>
                    <Badge
                      variant={
                        h.status === "success"
                          ? "success"
                          : h.status === "pending"
                            ? "info"
                            : "destructive"
                      }
                      className="text-[9px]"
                    >
                      {h.status === "pending" && (
                        <RotateCw className="size-3 animate-spin" />
                      )}
                      {h.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{h.routes ?? 1} hop · {h.priceImpact?.toFixed(2) ?? "—"}% impact</span>
                    <span>{formatRelativeTime(h.timestamp)}</span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

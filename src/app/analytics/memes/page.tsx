"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Sparkline } from "@/components/ui/sparkline";
import { Badge } from "@/components/ui/badge";
import { TokenIcon } from "@/components/shared/token-icon";
import { useMarketTokens } from "@/hooks/use-market-tokens";
import { cn, formatCompact } from "@/lib/utils";

const MEME_MINTS = [
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", // WIF
  "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5", // MEW
  "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", // POPCAT
  "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82", // BOME
  "HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4", // MYRO
  "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3", // SLERF
  "FU1q8vJpZNUrmqsciSjp8bAKKidGsLmouB8CBdf8TKQv", // TREMP
];

export default function MemesPage() {
  const { tokens, isLoading, lastUpdated } = useMarketTokens(MEME_MINTS);
  const data = useMemo(
    () => [...tokens].sort((a, b) => b.volume24h - a.volume24h),
    [tokens],
  );

  return (
    <SectionShell
      title="Meme Coin Radar"
      description="Quickfire overview of the loudest memes on Solana right now."
      badge={isLoading ? "Loading" : "Live · 30s"}
      baseHref="/analytics"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="size-4 text-amber-400" /> Live radar
          </CardTitle>
          <CardDescription>
            {lastUpdated
              ? `Live prices via DexScreener · refreshed ${new Date(lastUpdated).toLocaleTimeString()}`
              : "Loading meme data from DexScreener…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {isLoading && data.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[150px] rounded-xl" />
                ))
              : data.map((m, i) => {
                  const positive = m.change24h >= 0;
                  return (
                    <motion.div
                      key={m.address}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <TokenIcon src={m.logoURI} symbol={m.symbol} size={32} />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{m.symbol}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{m.name}</div>
                          </div>
                        </div>
                        <Badge
                          variant={positive ? "success" : "destructive"}
                          className="text-[10px] shrink-0"
                        >
                          {positive ? "+" : ""}
                          {m.change24h.toFixed(1)}%
                        </Badge>
                      </div>
                      <div
                        className={cn("mt-3", positive ? "text-emerald-400" : "text-rose-400")}
                      >
                        <Sparkline
                          values={m.spark}
                          color={positive ? "#34d399" : "#f87171"}
                          className="!h-10 !w-full"
                        />
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-2 flex items-center justify-between">
                        <span>Vol ${formatCompact(m.volume24h)}</span>
                        <span>Liq ${formatCompact(m.liquidity)}</span>
                      </div>
                    </motion.div>
                  );
                })}
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useMarketTokens } from "@/hooks/use-market-tokens";
import { getMockTrendingTokens } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";

export function TrendingMarquee() {
  const { tokens: live, isLoading } = useMarketTokens();
  const tokens = !isLoading && live.length > 0 ? live : getMockTrendingTokens();
  const repeated = [...tokens, ...tokens];

  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.01]">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
      <div className="flex animate-marquee whitespace-nowrap gap-6 py-3">
        {repeated.map((t, i) => (
          <div
            key={`${t.address}-${i}`}
            className="flex items-center gap-2 text-xs"
          >
            {t.logoURI ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.logoURI}
                alt={t.symbol}
                loading="lazy"
                className="size-5 rounded-full"
              />
            ) : (
              <span className="size-5 rounded-full bg-white/10" />
            )}
            <span className="font-medium">{t.symbol}</span>
            <span className="text-muted-foreground font-mono">
              {formatPrice(t.price)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-mono",
                t.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {t.change24h >= 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {t.change24h.toFixed(2)}%
            </span>
            <span className="text-white/10">|</span>
          </div>
        ))}
      </div>
    </section>
  );
}

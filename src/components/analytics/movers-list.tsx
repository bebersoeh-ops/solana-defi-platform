"use client";

import { useMemo } from "react";
import { TokenIcon } from "@/components/shared/token-icon";
import { Sparkline } from "@/components/ui/sparkline";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketTokens } from "@/hooks/use-market-tokens";
import { cn, formatNumber, formatPrice } from "@/lib/utils";

export function MoversList({ tone = "gainers" }: { tone: "gainers" | "losers" }) {
  const { tokens: live, isLoading } = useMarketTokens();
  const tokens = useMemo(() => {
    if (live.length === 0) return [];
    if (tone === "gainers") {
      return [...live].sort((a, b) => b.change24h - a.change24h);
    }
    return [...live].sort((a, b) => a.change24h - b.change24h);
  }, [live, tone]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
          <tr>
            <th className="text-left px-5 py-2 font-medium">#</th>
            <th className="text-left px-2 py-2 font-medium">Token</th>
            <th className="text-right px-2 py-2 font-medium">Price</th>
            <th className="text-right px-2 py-2 font-medium">24h</th>
            <th className="text-right px-2 py-2 font-medium hidden sm:table-cell">Volume</th>
            <th className="text-right px-5 py-2 font-medium">Trend</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && tokens.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={`skel-${i}`} className="border-b border-white/[0.03]">
                  <td className="px-5 py-3"><Skeleton className="h-4 w-6" /></td>
                  <td className="px-2 py-3"><Skeleton className="h-6 w-28" /></td>
                  <td className="px-2 py-3 text-right"><Skeleton className="ml-auto h-4 w-14" /></td>
                  <td className="px-2 py-3 text-right"><Skeleton className="ml-auto h-4 w-14" /></td>
                  <td className="px-2 py-3 text-right hidden sm:table-cell"><Skeleton className="ml-auto h-4 w-16" /></td>
                  <td className="px-5 py-3 text-right"><Skeleton className="ml-auto h-7 w-20" /></td>
                </tr>
              ))
            : null}
          {tokens.map((t, i) => (
            <tr key={t.address} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
              <td className="px-5 py-2.5 font-mono text-muted-foreground">{i + 1}</td>
              <td className="px-2 py-2.5">
                <div className="flex items-center gap-2.5">
                  <TokenIcon src={t.logoURI} symbol={t.symbol} size={26} />
                  <div>
                    <div className="text-sm font-medium">{t.symbol}</div>
                    <div className="text-[10px] text-muted-foreground">{t.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-2 py-2.5 text-right font-mono">{formatPrice(t.price)}</td>
              <td
                className={cn(
                  "px-2 py-2.5 text-right font-mono",
                  t.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {t.change24h >= 0 ? "+" : ""}
                {t.change24h.toFixed(2)}%
              </td>
              <td className="px-2 py-2.5 text-right hidden sm:table-cell">${formatNumber(t.volume24h)}</td>
              <td className="px-5 py-2.5 text-right">
                <Sparkline values={t.spark} color={t.change24h >= 0 ? "#34d399" : "#f87171"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

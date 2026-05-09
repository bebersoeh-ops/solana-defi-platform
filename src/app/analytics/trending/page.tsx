"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenIcon } from "@/components/shared/token-icon";
import { Sparkline } from "@/components/ui/sparkline";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { getMockTrendingTokens } from "@/lib/mock-data";
import { cn, formatNumber, formatPrice } from "@/lib/utils";

export default function TrendingPage() {
  const section = SECTIONS.find((s) => s.href === "/analytics")!;
  const tokens = useMemo(() => getMockTrendingTokens(), []);

  return (
    <SectionShell
      title="Trending Tokens"
      description="Top movers and most-routed pairs across Jupiter in the last 24h."
      badge="Live"
      baseHref="/analytics"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="size-4 text-amber-400" />
            Top trending
          </CardTitle>
          <CardDescription>Sort by volume, change, or market cap.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">#</th>
                  <th className="text-left px-2 py-2 font-medium">Token</th>
                  <th className="text-right px-2 py-2 font-medium">Price</th>
                  <th className="text-right px-2 py-2 font-medium">24h</th>
                  <th className="text-right px-2 py-2 font-medium hidden sm:table-cell">Volume</th>
                  <th className="text-right px-2 py-2 font-medium hidden md:table-cell">Liquidity</th>
                  <th className="text-right px-2 py-2 font-medium hidden lg:table-cell">Holders</th>
                  <th className="text-right px-5 py-2 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t, i) => (
                  <tr key={t.address} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-5 py-2.5 text-muted-foreground font-mono">{i + 1}</td>
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
                    <td className="px-2 py-2.5 text-right hidden sm:table-cell">
                      ${formatNumber(t.volume24h)}
                    </td>
                    <td className="px-2 py-2.5 text-right hidden md:table-cell">
                      ${formatNumber(t.liquidity)}
                    </td>
                    <td className="px-2 py-2.5 text-right hidden lg:table-cell">
                      {formatNumber(t.holders)}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <Sparkline values={t.spark} color={t.change24h >= 0 ? "#34d399" : "#f87171"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

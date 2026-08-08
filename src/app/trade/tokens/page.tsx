"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TokenIcon } from "@/components/shared/token-icon";
import { STATIC_TOKENS } from "@/lib/tokens";
import { Compass, Search, Star } from "lucide-react";
import { Sparkline } from "@/components/ui/sparkline";
import { getMockTrendingTokens } from "@/lib/mock-data";
import { useSwapStore } from "@/store/swap-store";
import { cn, formatNumber, formatPrice } from "@/lib/utils";

export default function TokenExplorerPage() {
  const section = SECTIONS.find((s) => s.href === "/trade")!;
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const favs = useSwapStore((s) => s.favorites);
  const toggleFav = useSwapStore((s) => s.toggleFavorite);

  const trending = useMemo(() => getMockTrendingTokens(), []);
  const trendMap = useMemo(() => {
    const map = new Map<string, (typeof trending)[number]>();
    trending.forEach((t) => map.set(t.address, t));
    return map;
  }, [trending]);

  const tags = useMemo(() => {
    const s = new Set<string>();
    for (const t of STATIC_TOKENS) for (const tg of t.tags ?? []) s.add(tg);
    return Array.from(s);
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return STATIC_TOKENS.filter((t) => {
      if (tag && !(t.tags ?? []).includes(tag)) return false;
      if (!ql) return true;
      return (
        t.symbol.toLowerCase().includes(ql) ||
        t.name.toLowerCase().includes(ql) ||
        t.address.toLowerCase().includes(ql)
      );
    });
  }, [q, tag]);

  return (
    <SectionShell
      title="Token Explorer"
      description="Browse Solana's liquid token universe. Filter, search, and pin favorites. Prices and trends shown here are demo — use Analytics for live data."
      badge="Demo · curated list"
      baseHref="/trade"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Compass className="size-4" /> All tokens
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search symbol, name, or mint…"
                className="pl-9"
              />
            </div>
          </div>
          <CardDescription className="pt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setTag(null)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs",
                !tag
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/[0.06] hover:border-white/15 text-muted-foreground"
              )}
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs capitalize",
                  tag === t
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/[0.06] hover:border-white/15 text-muted-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">Token</th>
                  <th className="text-right px-2 py-2 font-medium">Price</th>
                  <th className="text-right px-2 py-2 font-medium">24h</th>
                  <th className="text-right px-2 py-2 font-medium hidden sm:table-cell">Volume</th>
                  <th className="text-right px-2 py-2 font-medium hidden md:table-cell">Market cap</th>
                  <th className="text-right px-2 py-2 font-medium hidden lg:table-cell">Trend</th>
                  <th className="text-right px-5 py-2 font-medium">Watch</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const tr = trendMap.get(t.address);
                  const fav = favs.includes(t.address);
                  return (
                    <tr key={t.address} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <TokenIcon src={t.logoURI} symbol={t.symbol} size={26} />
                          <div>
                            <div className="text-sm font-medium flex items-center gap-2">
                              {t.symbol}
                              {t.tags?.[0] ? (
                                <Badge variant="secondary" className="text-[9px] py-0">
                                  {t.tags[0]}
                                </Badge>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{t.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono">
                        {tr ? formatPrice(tr.price) : "—"}
                      </td>
                      <td
                        className={cn(
                          "px-2 py-2.5 text-right font-mono",
                          tr && tr.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}
                      >
                        {tr ? `${tr.change24h >= 0 ? "+" : ""}${tr.change24h.toFixed(2)}%` : "—"}
                      </td>
                      <td className="px-2 py-2.5 text-right hidden sm:table-cell">
                        {tr ? `$${formatNumber(tr.volume24h)}` : "—"}
                      </td>
                      <td className="px-2 py-2.5 text-right hidden md:table-cell">
                        {tr ? `$${formatNumber(tr.marketCap)}` : "—"}
                      </td>
                      <td className="px-2 py-2.5 text-right hidden lg:table-cell">
                        {tr ? (
                          <Sparkline
                            values={tr.spark}
                            color={tr.change24h >= 0 ? "#34d399" : "#f87171"}
                          />
                        ) : null}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => toggleFav(t.address)}
                          className={cn(
                            "p-1 rounded-md",
                            fav ? "text-amber-400" : "text-muted-foreground/40 hover:text-foreground"
                          )}
                        >
                          <Star className="size-4" fill={fav ? "currentColor" : "none"} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

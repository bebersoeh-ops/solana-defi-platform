"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TokenIcon } from "@/components/shared/token-icon";
import { getMockPortfolioAssets } from "@/lib/mock-data";
import { Coins, Search } from "lucide-react";
import { cn, formatNumber, formatUsd } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";
import { PortfolioHeroSummary } from "@/components/portfolio/hero-summary";

export default function AssetsPage() {
  const section = SECTIONS.find((s) => s.href === "/portfolio")!;
  const [q, setQ] = useState("");
  const hideSmall = usePortfolioStore((s) => s.hideSmallBalances);
  const setHideSmall = usePortfolioStore((s) => s.setHideSmallBalances);

  const all = useMemo(() => getMockPortfolioAssets(), []);
  const filtered = useMemo(
    () =>
      all.filter((a) => {
        if (hideSmall && a.value < 50) return false;
        if (q) return a.symbol.toLowerCase().includes(q.toLowerCase());
        return true;
      }),
    [all, hideSmall, q]
  );

  return (
    <SectionShell
      title="Assets"
      description="All token holdings across your tracked wallets."
      badge={`${all.length} tokens`}
      baseHref="/portfolio"
    >
      <div className="space-y-5">
        <PortfolioHeroSummary />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="flex items-center gap-2">
                <Coins className="size-4" /> Holdings
              </CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={hideSmall} onCheckedChange={setHideSmall} />
                  Hide &lt; $50
                </label>
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="pl-9" />
                </div>
              </div>
            </div>
            <CardDescription>Mock data shown when no wallet is connected.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                  <tr>
                    <th className="text-left px-5 py-2 font-medium">Asset</th>
                    <th className="text-right px-2 py-2 font-medium">Balance</th>
                    <th className="text-right px-2 py-2 font-medium">Price</th>
                    <th className="text-right px-2 py-2 font-medium">24h</th>
                    <th className="text-right px-2 py-2 font-medium">Allocation</th>
                    <th className="text-right px-5 py-2 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.address} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <TokenIcon src={a.logoURI} symbol={a.symbol} size={26} />
                          <div>
                            <div className="text-sm font-medium">{a.symbol}</div>
                            <div className="text-[10px] text-muted-foreground">{a.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono">
                        {formatNumber(a.balance, 4)}
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono">
                        ${a.price < 1 ? a.price.toFixed(6) : formatNumber(a.price)}
                      </td>
                      <td
                        className={cn(
                          "px-2 py-2.5 text-right font-mono",
                          a.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}
                      >
                        {a.change24h >= 0 ? "+" : ""}
                        {a.change24h.toFixed(2)}%
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-white/[0.04] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent"
                              style={{ width: `${a.allocation}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {a.allocation.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-right font-medium">
                        {formatUsd(a.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

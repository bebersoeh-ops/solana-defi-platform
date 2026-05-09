"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Plus, Copy, Trash2, Eye, ChartLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useMounted } from "@/hooks/use-mounted";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { shortenAddress, formatUsd } from "@/lib/utils";
import { PortfolioHeroSummary } from "@/components/portfolio/hero-summary";
import { getMockActivityFeed } from "@/lib/mock-data";
import { formatRelativeTime, formatNumber } from "@/lib/utils";
import { toast } from "sonner";

export default function WalletOverviewPage() {
  const section = SECTIONS.find((s) => s.href === "/portfolio")!;
  const mounted = useMounted();
  const wallets = usePortfolioStore((s) => s.trackedWallets);
  const addWallet = usePortfolioStore((s) => s.addWallet);
  const removeWallet = usePortfolioStore((s) => s.removeWallet);
  const [input, setInput] = useState("");
  const events = useMemo(() => getMockActivityFeed(8), []);

  return (
    <SectionShell
      title="Wallet Overview"
      description="Aggregated dashboard across every tracked wallet, with allocation and activity at a glance."
      badge="Aggregated"
      baseHref="/portfolio"
    >
      <div className="space-y-5">
        <PortfolioHeroSummary />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-4 text-primary" /> Tracked wallets
              </CardTitle>
              <CardDescription>Add multiple Solana addresses to aggregate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!input) return;
                  addWallet(input);
                  toast.success("Wallet added");
                  setInput("");
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Solana address (base58)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button type="submit" variant="gradient" size="default">
                  <Plus className="size-4" /> Add
                </Button>
              </form>
              {!mounted ? null : wallets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-6 text-center text-sm text-muted-foreground">
                  No tracked wallets yet
                </div>
              ) : (
                <ul className="space-y-2">
                  {wallets.map((w) => (
                    <li
                      key={w}
                      className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
                    >
                      <span className="font-mono text-xs">{shortenAddress(w, 6)}</span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(w);
                            toast.success("Copied");
                          }}
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => removeWallet(w)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartLine className="size-4 text-primary" /> Recent activity
              </CardTitle>
              <CardDescription>Mock feed across all tracked wallets.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="divide-y divide-white/[0.04]">
                {events.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 px-5 py-2.5">
                    <Badge variant="secondary" className="text-[9px] uppercase">
                      {e.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs">
                        {formatNumber(e.amount, 2)} {e.token}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {e.user}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs">{formatUsd(e.value)}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(e.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionShell>
  );
}

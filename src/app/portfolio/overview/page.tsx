"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Plus, Copy, Trash2, ChartLine, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useMounted } from "@/hooks/use-mounted";
import { useWalletTokens } from "@/hooks/use-wallet-tokens";
import { Input } from "@/components/ui/input";
import { shortenAddress, formatUsd, formatRelativeTime } from "@/lib/utils";
import { PortfolioHeroSummary } from "@/components/portfolio/hero-summary";
import {
  fetchSignaturesForAddress,
  type RpcSignature,
} from "@/lib/market-data";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

export default function WalletOverviewPage() {
  const mounted = useMounted();
  const wallets = usePortfolioStore((s) => s.trackedWallets);
  const addWallet = usePortfolioStore((s) => s.addWallet);
  const removeWallet = usePortfolioStore((s) => s.removeWallet);
  const [input, setInput] = useState("");
  const wallet = useWalletTokens();
  const { publicKey } = useWallet();
  const [sigs, setSigs] = useState<RpcSignature[]>([]);
  const [sigsLoading, setSigsLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setSigs([]);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setSigsLoading(true);
    fetchSignaturesForAddress(publicKey.toString(), 10, controller.signal)
      .then((s) => {
        if (!cancelled) setSigs(s);
      })
      .finally(() => {
        if (!cancelled) setSigsLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [publicKey]);

  const top = useMemo(
    () => wallet.assets.slice(0, 6),
    [wallet.assets],
  );

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
              <CardDescription>
                {publicKey
                  ? "Last 10 on-chain signatures for the connected wallet (Solana RPC)."
                  : "Connect a wallet to see your last on-chain signatures."}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="divide-y divide-white/[0.04]">
                {!publicKey ? (
                  <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No wallet connected.
                  </div>
                ) : sigsLoading && sigs.length === 0 ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-5 py-2.5">
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))
                ) : sigs.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No recent signatures.
                  </div>
                ) : (
                  sigs.map((s) => (
                    <a
                      key={s.signature}
                      href={`https://solscan.io/tx/${s.signature}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02]"
                    >
                      <Badge
                        variant={s.err ? "destructive" : "secondary"}
                        className="text-[9px] uppercase"
                      >
                        {s.err ? "failed" : "ok"}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono truncate">
                          {shortenAddress(s.signature, 12)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          slot {s.slot}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground">
                          {s.blockTime
                            ? formatRelativeTime(s.blockTime * 1000)
                            : "—"}
                        </div>
                        <ArrowUpRight className="size-3 text-muted-foreground ml-auto" />
                      </div>
                    </a>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {wallet.isConnected && top.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Top holdings</CardTitle>
              <CardDescription>
                Top 6 SPL tokens by USD value · {formatUsd(wallet.totalValue)} total
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {top.map((a) => (
                <div
                  key={a.address}
                  className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{a.symbol}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {a.allocation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatUsd(a.value)} · {a.amount.toLocaleString()} {a.symbol}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </SectionShell>
  );
}

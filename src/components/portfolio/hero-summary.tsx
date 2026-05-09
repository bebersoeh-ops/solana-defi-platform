"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, Eye, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMockPortfolioAssets, getMockPnlSeries } from "@/lib/mock-data";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatUsd } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useWalletTokens } from "@/hooks/use-wallet-tokens";

export function PortfolioHeroSummary() {
  const privacy = usePortfolioStore((s) => s.privacyMode);
  const wallet = useWalletTokens();
  const assets = useMemo(
    () =>
      wallet.isConnected && wallet.assets.length > 0
        ? wallet.assets
        : getMockPortfolioAssets(),
    [wallet.isConnected, wallet.assets],
  );
  const series = useMemo(() => getMockPnlSeries(30), []);

  const total = wallet.isConnected ? wallet.totalValue : assets.reduce((s, a) => s + a.value, 0);
  const change24hPct = wallet.isConnected && assets.length > 0
    ? assets.reduce((sum, a) => sum + (a.allocation / 100) * a.change24h, 0)
    : (series[series.length - 1].value - series[0].value) / series[0].value * 100;
  const change24hAbs = (total * change24hPct) / 100;

  const display = (n: number) => (privacy ? "•••••" : formatUsd(n));

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="size-3.5" /> Total portfolio value
            {privacy ? (
              <Badge variant="secondary" className="text-[9px]">
                <Lock className="size-2.5" />
                PRIVATE
              </Badge>
            ) : wallet.isConnected ? (
              <Badge variant="live" className="text-[9px]">
                <Eye className="size-2.5" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[9px]">
                DEMO
              </Badge>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight"
          >
            {display(total)}
          </motion.div>
          <div
            className={`text-sm font-medium ${change24hPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {privacy
              ? "•••"
              : `${change24hPct >= 0 ? "+" : ""}${formatUsd(change24hAbs)} (${change24hPct.toFixed(2)}%) · 24h`}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3">
            <Mini label="Tokens" value={String(assets.length)} />
            <Mini label="Largest" value={`${assets[0]?.symbol ?? "—"}`} />
            <Mini
              label="24h"
              value={`${change24hPct >= 0 ? "+" : ""}${change24hPct.toFixed(2)}%`}
            />
          </div>
        </div>
        <div className="lg:col-span-3 h-[180px] lg:h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--neon-mint))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--neon-mint))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis hide dataKey="timestamp" />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,12,18,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  fontSize: 11,
                }}
                formatter={(v: unknown) => [formatUsd(Number(v) || 0), "Value"]}
                labelFormatter={(label: unknown) =>
                  new Date(Number(label)).toLocaleDateString()
                }
              />
              <Area
                dataKey="value"
                stroke="hsl(var(--neon-mint))"
                strokeWidth={2}
                fill="url(#portfolioFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

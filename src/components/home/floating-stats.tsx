"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Coins,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { useMarketTokens } from "@/hooks/use-market-tokens";
import { useSolanaStats } from "@/hooks/use-solana-stats";
import { formatCompact, formatPrice } from "@/lib/utils";

export function FloatingStats() {
  const { stats: sol, isLoading: solLoading } = useSolanaStats();
  const { tokens, isLoading: tokensLoading } = useMarketTokens();

  const aggregateVolume = tokens.reduce((sum, t) => sum + t.volume24h, 0);
  const aggregateLiquidity = tokens.reduce((sum, t) => sum + t.liquidity, 0);
  const tokensTracked = tokens.length;

  const cards: Array<{
    label: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    glow?: boolean;
    loading: boolean;
  }> = [
    {
      label: "SOL price",
      value: sol ? formatPrice(sol.priceUsd) : "—",
      change: sol?.change24h,
      icon: <DollarSign className="size-4" />,
      glow: true,
      loading: solLoading,
    },
    {
      label: "SOL 24h volume",
      value: sol ? `$${formatCompact(sol.volume24h)}` : "—",
      icon: <Activity className="size-4" />,
      loading: solLoading,
    },
    {
      label: "Aggregated DEX volume",
      value: aggregateVolume > 0 ? `$${formatCompact(aggregateVolume)}` : "—",
      icon: <TrendingUp className="size-4" />,
      loading: tokensLoading,
    },
    {
      label: "Tracked liquidity",
      value:
        aggregateLiquidity > 0 ? `$${formatCompact(aggregateLiquidity)}` : "—",
      change: tokensTracked,
      icon: <Coins className="size-4" />,
      loading: tokensLoading,
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <StatCard
              label={s.label}
              value={s.loading && s.value === "—" ? "Loading…" : s.value}
              change={s.change}
              icon={s.icon}
              glow={s.glow}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

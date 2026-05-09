"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] glass-card">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/20 blur-[100px] animate-aurora" />
      <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-accent/20 blur-[100px] animate-aurora" />

      <div className="relative px-6 py-12 sm:px-10 sm:py-16 md:px-14 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <Badge variant="default" className="mb-5 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live · Powered by Jupiter</span>
            <Sparkles className="size-3 ml-1" />
          </Badge>

          <h1 className="font-semibold tracking-tight leading-[0.95] text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block text-foreground/95">Trade Solana</span>
            <span className="block text-gradient pb-1">at the speed of light.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
            {APP_NAME} aggregates every Solana DEX through Jupiter's
            best-route engine. Swap, analyze, and run your portfolio from a
            single, opinionated terminal — built for serious on-chain operators.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/trade/swap"
              className={buttonVariants({ size: "xl", variant: "gradient" })}
            >
              <Zap className="size-4" />
              Open swap terminal
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/portfolio/overview"
              className={buttonVariants({ size: "xl", variant: "glass" })}
            >
              Explore portfolio
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_hsl(var(--neon-mint))]" />
              <span>Mainnet RPC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-sky-400" />
              <span>Jupiter v6 routes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-fuchsia-400" />
              <span>Non-custodial</span>
            </div>
          </div>
        </motion.div>

        <FloatingChip
          className="hidden md:block"
          style={{ top: 80, right: 60 }}
          accent="from-primary/40 to-accent/40"
        >
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Best route
          </div>
          <div className="font-mono text-sm">SOL → USDC · 4 hops</div>
          <div className="text-[10px] text-emerald-400 mt-1">↑ 0.07% over avg</div>
        </FloatingChip>

        <FloatingChip
          className="hidden lg:block"
          style={{ bottom: 70, right: 200 }}
          accent="from-fuchsia-400/40 to-sky-400/40"
          delay={0.4}
        >
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            24h volume
          </div>
          <div className="font-mono text-sm">$2.84B</div>
          <div className="text-[10px] text-emerald-400 mt-1">+12.4%</div>
        </FloatingChip>
      </div>
    </section>
  );
}

function FloatingChip({
  children,
  className,
  style,
  accent,
  delay = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      style={style}
      className={`absolute glass-strong rounded-xl px-3 py-2.5 border border-white/[0.08] animate-float ${className}`}
    >
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${accent} opacity-30 blur-xl -z-10`}
      />
      {children}
    </motion.div>
  );
}

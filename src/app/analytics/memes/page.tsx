"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Sparkline } from "@/components/ui/sparkline";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";

const MEMES = [
  { sym: "BONK", emoji: "🐕", name: "Bonk", chg: 18.2, vol: 184_000_000 },
  { sym: "WIF", emoji: "🧢", name: "dogwifhat", chg: 9.8, vol: 220_000_000 },
  { sym: "POPCAT", emoji: "🐱", name: "Popcat", chg: -3.2, vol: 64_000_000 },
  { sym: "MEW", emoji: "🐈", name: "cat in a dogs world", chg: 22.5, vol: 38_000_000 },
  { sym: "MYRO", emoji: "🐶", name: "Myro", chg: -7.4, vol: 12_000_000 },
  { sym: "BOME", emoji: "📚", name: "Book of Meme", chg: 5.1, vol: 24_000_000 },
  { sym: "TREMP", emoji: "🦁", name: "Doland Tremp", chg: 14.4, vol: 6_500_000 },
  { sym: "SLERF", emoji: "🦥", name: "Slerf", chg: -1.7, vol: 4_300_000 },
];

export default function MemesPage() {
  const section = SECTIONS.find((s) => s.href === "/analytics")!;
  const data = useMemo(() => MEMES, []);

  return (
    <SectionShell
      title="Meme Coin Radar"
      description="Quickfire overview of the loudest memes on Solana right now."
      badge="Hot"
      baseHref="/analytics"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="size-4 text-amber-400" /> Live radar
          </CardTitle>
          <CardDescription>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="size-3" /> Mock data — wire to your favorite indexer
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.map((m, i) => {
              const positive = m.chg >= 0;
              const series = Array.from({ length: 24 }, () => 50 + (Math.random() - (positive ? 0.3 : 0.7)) * 30);
              return (
                <motion.div
                  key={m.sym}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-gradient-to-br from-amber-500/30 to-rose-500/20 grid place-items-center text-base">
                        {m.emoji}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{m.sym}</div>
                        <div className="text-[10px] text-muted-foreground">{m.name}</div>
                      </div>
                    </div>
                    <Badge
                      variant={positive ? "success" : "destructive"}
                      className="text-[10px]"
                    >
                      {positive ? "+" : ""}
                      {m.chg.toFixed(1)}%
                    </Badge>
                  </div>
                  <div
                    className={cn("mt-3", positive ? "text-emerald-400" : "text-rose-400")}
                  >
                    <Sparkline values={series} color={positive ? "#34d399" : "#f87171"} className="!h-10 !w-full" />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-2">
                    Vol ${formatNumber(m.vol)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const insights = [
  {
    icon: Sparkles,
    title: "Memes outflow easing",
    body: "Net outflows from meme tokens slowed 38% in the last 6h, while LST inflows accelerated.",
  },
  {
    icon: Zap,
    title: "Route divergence detected",
    body: "Phoenix v2 and Meteora are quoting 0.18% better than route average for SOL/USDC mid-size orders.",
  },
];

export function AiInsight() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -top-16 -right-16 size-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-4 text-fuchsia-300" />
            Lumen AI
          </CardTitle>
          <Badge variant="accent">PREVIEW</Badge>
        </div>
        <CardDescription>Pattern recognition over the last 24h · demo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        {insights.map((ins, i) => (
          <motion.div
            key={ins.title}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <ins.icon className="size-3.5 text-fuchsia-300" />
              {ins.title}
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {ins.body}
            </p>
          </motion.div>
        ))}
        <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] p-3 text-[11px] text-muted-foreground">
          Insights are currently demo-only. Wire your own LLM via the
          <code className="font-mono px-1">NEXT_PUBLIC_AI_*</code> env vars.
        </div>
      </CardContent>
    </Card>
  );
}

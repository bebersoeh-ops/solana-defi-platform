"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getMockPortfolioAssets } from "@/lib/mock-data";
import { formatUsd } from "@/lib/utils";
import { TokenIcon } from "@/components/shared/token-icon";
import { PieChart as PieIcon } from "lucide-react";

const PALETTE = [
  "hsl(var(--neon-mint))",
  "hsl(var(--neon-purple))",
  "hsl(var(--neon-blue))",
  "hsl(var(--neon-pink))",
  "hsl(var(--neon-orange))",
  "rgba(255,255,255,0.5)",
  "rgba(255,255,255,0.3)",
];

export default function AllocationPage() {
  const section = SECTIONS.find((s) => s.href === "/portfolio")!;
  const assets = useMemo(() => getMockPortfolioAssets(), []);
  const total = assets.reduce((s, a) => s + a.value, 0);

  return (
    <SectionShell
      title="Token Allocation"
      description="Concentration breakdown across your portfolio."
      badge={`${assets.length} positions`}
      baseHref="/portfolio"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="size-4 text-primary" />
              Allocation
            </CardTitle>
            <CardDescription>Total value: {formatUsd(total)}</CardDescription>
          </CardHeader>
          <CardContent className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assets}
                  dataKey="value"
                  nameKey="symbol"
                  innerRadius={70}
                  outerRadius={130}
                  paddingAngle={2}
                  stroke="rgba(0,0,0,0.4)"
                >
                  {assets.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                  formatter={(v: unknown) => formatUsd(Number(v) || 0)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Concentration</CardTitle>
            <CardDescription>Each row sorted by allocation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {assets.map((a, i) => (
              <div key={a.address} className="flex items-center gap-2.5">
                <TokenIcon src={a.logoURI} symbol={a.symbol} size={22} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">{a.symbol}</div>
                  <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full"
                      style={{
                        width: `${a.allocation}%`,
                        background: PALETTE[i % PALETTE.length],
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground w-12 text-right">
                  {a.allocation.toFixed(1)}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fish } from "lucide-react";
import { formatNumber, formatRelativeTime, shortenAddress } from "@/lib/utils";

const PAIRS = ["SOL/USDC", "JUP/USDC", "BONK/SOL", "JTO/USDC", "WIF/USDC", "PYTH/USDC"];

export default function WhalesPage() {
  const section = SECTIONS.find((s) => s.href === "/analytics")!;
  const events = useMemo(() => {
    const out = [] as Array<{
      id: string;
      time: number;
      pair: string;
      side: "buy" | "sell";
      amount: number;
      address: string;
    }>;
    for (let i = 0; i < 18; i++) {
      out.push({
        id: `whale-${i}`,
        time: Date.now() - i * 60_000 * (1 + Math.random() * 5),
        pair: PAIRS[i % PAIRS.length],
        side: Math.random() > 0.5 ? "buy" : "sell",
        amount: 80_000 + Math.random() * 1_400_000,
        address: `Wha1${"abcdef0123".repeat(3)}${i}xyz`,
      });
    }
    return out;
  }, []);

  return (
    <SectionShell
      title="Whale Activity"
      description="Track $50k+ swaps in real-time. Filter and inspect each route."
      badge=">$50k"
      baseHref="/analytics"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="size-4 text-primary" /> Recent whale swaps
          </CardTitle>
          <CardDescription>Mock data shown when offline</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">Time</th>
                  <th className="text-left px-2 py-2 font-medium">Side</th>
                  <th className="text-left px-2 py-2 font-medium">Pair</th>
                  <th className="text-right px-2 py-2 font-medium">Amount</th>
                  <th className="text-right px-5 py-2 font-medium">Wallet</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-5 py-2.5 text-muted-foreground">{formatRelativeTime(e.time)}</td>
                    <td className="px-2 py-2.5">
                      <Badge
                        variant={e.side === "buy" ? "success" : "destructive"}
                        className="text-[9px] uppercase"
                      >
                        {e.side}
                      </Badge>
                    </td>
                    <td className="px-2 py-2.5 font-medium">{e.pair}</td>
                    <td className="px-2 py-2.5 text-right font-mono">${formatNumber(e.amount)}</td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs">
                      {shortenAddress(e.address, 6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

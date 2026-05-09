"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMockLeaderboard } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

export function LeaderboardTeaser() {
  const rows = useMemo(() => getMockLeaderboard().slice(0, 6), []);
  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top traders this week</CardTitle>
            <CardDescription>Mock leaderboard · placeholder data</CardDescription>
          </div>
          <Badge variant="accent">DEMO</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <th className="text-left px-5 py-2 font-medium">Rank</th>
                <th className="text-left px-2 py-2 font-medium">Address</th>
                <th className="text-right px-2 py-2 font-medium">PnL (7d)</th>
                <th className="text-right px-2 py-2 font-medium">Volume</th>
                <th className="text-right px-2 py-2 font-medium">Trades</th>
                <th className="text-right px-5 py-2 font-medium">Win rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.rank} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-2.5">
                    <div className="size-6 rounded-md bg-white/[0.03] grid place-items-center text-xs font-medium">
                      {r.rank}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 font-mono text-xs">{r.address}</td>
                  <td className="px-2 py-2.5 text-right text-emerald-400 font-medium">
                    +${formatNumber(r.pnl, 0)}
                  </td>
                  <td className="px-2 py-2.5 text-right">${formatNumber(r.volume, 0)}</td>
                  <td className="px-2 py-2.5 text-right text-muted-foreground">{r.trades}</td>
                  <td className="px-5 py-2.5 text-right">{r.winRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

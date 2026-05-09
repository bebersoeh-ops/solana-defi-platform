"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMockActivityFeed } from "@/lib/mock-data";
import { formatNumber, formatRelativeTime, formatUsd } from "@/lib/utils";
import { Activity, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TYPES: Array<{ id: string; label: string }> = [
  { id: "all", label: "All" },
  { id: "swap", label: "Swap" },
  { id: "transfer", label: "Transfer" },
  { id: "stake", label: "Stake" },
  { id: "mint", label: "Mint" },
];

export default function HistoryPage() {
  const section = SECTIONS.find((s) => s.href === "/portfolio")!;
  const events = useMemo(() => getMockActivityFeed(40), []);
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);

  return (
    <SectionShell
      title="Transaction History"
      description="Every on-chain event across your tracked wallets. Filter by type and export to CSV."
      badge={`${events.length} events`}
      baseHref="/portfolio"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-primary" /> Events
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Filter className="size-3.5 text-muted-foreground" />
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFilter(t.id)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs",
                      filter === t.id
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/[0.06] hover:border-white/15"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="ghost">
                <Download className="size-3.5" /> CSV
              </Button>
            </div>
          </div>
          <CardDescription>Mock data shown when no wallet connected.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">Type</th>
                  <th className="text-left px-2 py-2 font-medium">Wallet</th>
                  <th className="text-right px-2 py-2 font-medium">Amount</th>
                  <th className="text-left px-2 py-2 font-medium">Token</th>
                  <th className="text-right px-2 py-2 font-medium">Value</th>
                  <th className="text-right px-5 py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-5 py-2.5">
                      <Badge
                        variant={
                          e.type === "swap"
                            ? "default"
                            : e.type === "transfer"
                              ? "info"
                              : e.type === "stake"
                                ? "accent"
                                : "warning"
                        }
                        className="text-[9px] uppercase"
                      >
                        {e.type}
                      </Badge>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-xs">{e.user}</td>
                    <td className="px-2 py-2.5 text-right font-mono">
                      {formatNumber(e.amount, 2)}
                    </td>
                    <td className="px-2 py-2.5 text-xs">{e.token}</td>
                    <td className="px-2 py-2.5 text-right">{formatUsd(e.value)}</td>
                    <td className="px-5 py-2.5 text-right text-muted-foreground">
                      {formatRelativeTime(e.timestamp)}
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

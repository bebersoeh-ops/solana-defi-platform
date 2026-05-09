"use client";

import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressInput } from "@/components/tools/address-input";
import { Flame, Lock, Unlock, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LpBurnPage() {
  const section = SECTIONS.find((s) => s.href === "/tools")!;
  return (
    <SectionShell
      title="LP Burn Checker"
      description="Verify whether the liquidity pool tokens have been burned, locked, or remain in dev hands."
      badge="Heuristic"
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-4 text-amber-400" /> Pair lookup
            </CardTitle>
            <CardDescription>Enter pool or LP mint address.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="LP token mint…" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>LP status</CardTitle>
            <CardDescription>Mock summary for SOL/USDC Raydium CLMM</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Status icon={<Flame className="size-4" />} label="Burned" value="42%" tone="emerald" />
            <Status icon={<Lock className="size-4" />} label="Locked" value="51%" tone="emerald" />
            <Status icon={<Unlock className="size-4" />} label="Free-floating" value="7%" tone="amber" />
          </CardContent>
          <CardContent className="space-y-2 pt-0">
            {[
              { actor: "Raydium burn vault", state: "burned", value: "42.0%" },
              { actor: "Streamflow lock", state: "locked", value: "51.0%", until: "2027-06-12" },
              { actor: "Treasury wallet", state: "live", value: "5.4%" },
              { actor: "Multi-sig 2/3", state: "live", value: "1.6%" },
            ].map((row) => (
              <div
                key={row.actor}
                className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={row.state === "burned" || row.state === "locked" ? "success" : "warning"}
                    className="text-[9px] uppercase"
                  >
                    {row.state}
                  </Badge>
                  <div className="text-xs">
                    <div>{row.actor}</div>
                    {row.until ? (
                      <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                        <Clock className="size-2.5" /> Unlocks {row.until}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="text-xs font-mono">{row.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function Status({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "amber" | "rose";
}) {
  const c = {
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-400",
  } as const;
  return (
    <div className={`rounded-lg border ${c[tone]} px-3 py-3`}>
      <div className="flex items-center gap-2 text-xs">{icon}{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

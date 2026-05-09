"use client";

import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressInput } from "@/components/tools/address-input";
import { ShieldAlert, AlertTriangle, BarChart3 } from "lucide-react";

const FACTORS = [
  { name: "Holder concentration", weight: 0.32, score: 65 },
  { name: "Liquidity locked", weight: 0.22, score: 88 },
  { name: "Developer activity", weight: 0.14, score: 72 },
  { name: "Mint authority", weight: 0.12, score: 100 },
  { name: "Code reputation", weight: 0.1, score: 60 },
  { name: "Social signals", weight: 0.1, score: 78 },
];

export default function RugRiskPage() {
  const section = SECTIONS.find((s) => s.href === "/tools")!;
  const composite = Math.round(
    FACTORS.reduce((s, f) => s + f.score * f.weight, 0)
  );
  const rating =
    composite >= 80 ? "Low" : composite >= 60 ? "Medium" : "High";
  const tone =
    composite >= 80
      ? "text-emerald-400"
      : composite >= 60
        ? "text-amber-400"
        : "text-rose-400";

  return (
    <SectionShell
      title="Rug Risk Checker"
      description="Composite rug-risk score combining holder, liquidity, and developer signals."
      badge="Heuristic"
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-300" /> Composite score
            </CardTitle>
            <CardDescription>Higher = safer.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-5 text-center">
              <div className={`text-5xl font-semibold ${tone}`}>{composite}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                {rating} risk
              </div>
            </div>
            <div className="mt-4">
              <AddressInput placeholder="SPL mint address…" />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" /> Factors
            </CardTitle>
            <CardDescription>Weighted score per signal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {FACTORS.map((f) => (
              <div key={f.name}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span>
                    {f.name}{" "}
                    <span className="text-muted-foreground/60">
                      · weight {(f.weight * 100).toFixed(0)}%
                    </span>
                  </span>
                  <span className="font-mono">{f.score}/100</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${f.score >= 80 ? "bg-emerald-400" : f.score >= 60 ? "bg-amber-400" : "bg-rose-400"}`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
              <span>
                Heuristic only — never treat as a guarantee. Always verify
                contract details independently.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

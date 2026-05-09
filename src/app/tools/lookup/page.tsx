"use client";

import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressInput } from "@/components/tools/address-input";
import { Search, Globe2 } from "lucide-react";

export default function LookupPage() {
  const section = SECTIONS.find((s) => s.href === "/tools")!;
  return (
    <SectionShell
      title="Address Lookup"
      description="Resolve a wallet, token mint, or program account to a quick summary."
      badge="Universal"
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="size-4 text-primary" /> Lookup
            </CardTitle>
            <CardDescription>Wallet, mint, or program — Lumen detects the type.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput
              hint={
                <div className="text-[11px] text-muted-foreground rounded-lg border border-dashed border-white/10 px-3 py-2 mt-3">
                  Wire to Helius / Triton getAccountInfo for live results.
                </div>
              }
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="size-4 text-primary" /> Quick links
            </CardTitle>
            <CardDescription>Open in popular Solana explorers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "Solscan",
              "Solana FM",
              "SolanaBeach",
              "XRAY (Helius)",
              "Birdeye",
            ].map((name) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs"
              >
                <span>{name}</span>
                <span className="text-muted-foreground">External</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

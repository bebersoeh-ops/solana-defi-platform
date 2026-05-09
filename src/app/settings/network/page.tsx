"use client";

import { SectionShell } from "@/components/shell/section-shell";
import { UTILITY_SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Globe, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SOLANA_RPC, JUPITER_API_BASE } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const PRESETS = [
  { name: "Solana mainnet (public)", url: SOLANA_RPC, latency: 312 },
  { name: "Helius (signed)", url: "https://mainnet.helius-rpc.com/?api-key=…", latency: 98 },
  { name: "Triton One", url: "https://triton.solana.com", latency: 124 },
  { name: "QuickNode", url: "https://quiknode.pro", latency: 142 },
];

export default function NetworkSettingsPage() {
  const section = UTILITY_SECTIONS.find((s) => s.href === "/settings")!;
  const [rpc, setRpc] = useState(SOLANA_RPC);

  return (
    <SectionShell
      title="Network"
      description="Customize the RPC endpoint and the Jupiter API base."
      badge="Endpoints"
      baseHref="/settings"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="size-4 text-primary" /> Solana RPC
            </CardTitle>
            <CardDescription>Used to fetch balances and broadcast txs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={rpc} onChange={(e) => setRpc(e.target.value)} className="font-mono text-xs" />
            <div className="space-y-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => setRpc(p.url)}
                  className="w-full flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 hover:border-white/15"
                >
                  <span className="text-xs">{p.name}</span>
                  <Badge variant="secondary" className="text-[9px] inline-flex items-center gap-1">
                    <Zap className="size-2.5" /> {p.latency}ms
                  </Badge>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full">Save endpoint (mock)</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-4 text-primary" /> Jupiter API
            </CardTitle>
            <CardDescription>Quote + swap base URL.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input defaultValue={JUPITER_API_BASE} className="font-mono text-xs" />
            <div className="text-[11px] text-muted-foreground rounded-lg border border-dashed border-white/10 px-3 py-2">
              Lumen uses the public lite API by default. Switch to paid tier for higher rate limits.
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

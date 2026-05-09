"use client";

import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressInput } from "@/components/tools/address-input";
import { FileJson, Tag, Hash, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MetadataPage() {
  const section = SECTIONS.find((s) => s.href === "/tools")!;
  const sample = {
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
    supply: "576,231,123",
    mintAuthority: "renounced",
    freezeAuthority: "renounced",
    mutable: false,
    extensions: ["website", "twitter", "coingecko"],
    creators: [
      { address: "So11111111111111111111111111111111111111112", verified: true, share: 100 },
    ],
  };
  return (
    <SectionShell
      title="Token Metadata Viewer"
      description="Inspect Metaplex / Token-2022 metadata for any SPL mint."
      badge="Metaplex"
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="size-4 text-primary" /> Mint address
            </CardTitle>
            <CardDescription>Paste any SPL mint to view metadata.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="SPL mint…" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="size-4 text-primary" /> Metadata
            </CardTitle>
            <CardDescription>Mock data for demo purposes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row icon={<Tag className="size-3.5" />} label="Name" value={sample.name} />
            <Row icon={<Tag className="size-3.5" />} label="Symbol" value={sample.symbol} />
            <Row icon={<Hash className="size-3.5" />} label="Decimals" value={String(sample.decimals)} />
            <Row icon={<Hash className="size-3.5" />} label="Supply" value={sample.supply} />
            <Row icon={<Tag className="size-3.5" />} label="Mint authority" value={sample.mintAuthority} tone="emerald" />
            <Row icon={<Tag className="size-3.5" />} label="Freeze authority" value={sample.freezeAuthority} tone="emerald" />
            <Row icon={<Tag className="size-3.5" />} label="Immutable" value={sample.mutable ? "no" : "yes"} tone={sample.mutable ? "amber" : "emerald"} />
            <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
              <span className="text-xs flex items-center gap-1.5">
                <Globe className="size-3.5 text-muted-foreground" /> Extensions
              </span>
              <div className="flex gap-1">
                {sample.extensions.map((e) => (
                  <Badge key={e} variant="secondary" className="text-[9px]">
                    {e}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5">Creators</div>
              {sample.creators.map((c) => (
                <div key={c.address} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                  <span className="font-mono text-xs">{c.address.slice(0, 14)}…</span>
                  <div className="flex items-center gap-2">
                    {c.verified ? (
                      <Badge variant="success" className="text-[9px]">VERIFIED</Badge>
                    ) : null}
                    <span className="text-xs">{c.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function Row({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "emerald" | "amber" | "rose";
}) {
  const tones = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  } as const;
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <span className="text-xs flex items-center gap-1.5 text-muted-foreground">
        {icon} {label}
      </span>
      <span className={`text-sm font-medium ${tone ? tones[tone] : ""}`}>{value}</span>
    </div>
  );
}

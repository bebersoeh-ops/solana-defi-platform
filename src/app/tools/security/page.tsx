"use client";

import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressInput } from "@/components/tools/address-input";
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const CHECKS = [
  { key: "mint_authority", label: "Mint authority renounced", state: "pass" as const },
  { key: "freeze_authority", label: "Freeze authority disabled", state: "pass" as const },
  { key: "lp_locked", label: "LP locked / burned", state: "warn" as const },
  { key: "owner_concentration", label: "Top 10 holders < 50%", state: "fail" as const },
  { key: "dev_wallet", label: "Dev wallet inactive 7d+", state: "pass" as const },
  { key: "metadata_immutable", label: "Metadata immutable", state: "warn" as const },
  { key: "honeypot", label: "Honeypot simulation", state: "pass" as const },
  { key: "rug_db", label: "Not on rug-watch lists", state: "pass" as const },
];

export default function SecurityPage() {
  const section = SECTIONS.find((s) => s.href === "/tools")!;
  return (
    <SectionShell
      title="Token Security Checker"
      description="Run a battery of safety checks on any SPL token mint."
      badge="Audit"
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-4 text-primary" /> Security checks
            </CardTitle>
            <CardDescription>Mock results — wire to your preferred scanner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {CHECKS.map((c) => (
              <CheckRow key={c.key} label={c.label} state={c.state} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mint address</CardTitle>
            <CardDescription>Paste an SPL mint to scan.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput placeholder="SPL mint address…" />
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function CheckRow({ label, state }: { label: string; state: "pass" | "warn" | "fail" }) {
  const conf = {
    pass: {
      icon: <ShieldCheck className="size-4 text-emerald-400" />,
      bg: "border-emerald-500/20 bg-emerald-500/5",
      txt: "Passing",
    },
    warn: {
      icon: <ShieldAlert className="size-4 text-amber-400" />,
      bg: "border-amber-500/20 bg-amber-500/5",
      txt: "Review",
    },
    fail: {
      icon: <ShieldX className="size-4 text-rose-400" />,
      bg: "border-rose-500/20 bg-rose-500/5",
      txt: "Failing",
    },
  } as const;
  const c = conf[state];
  return (
    <div
      className={`flex items-center justify-between rounded-lg border ${c.bg} px-3 py-2.5`}
    >
      <div className="flex items-center gap-2.5">
        {c.icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground">{c.txt}</span>
    </div>
  );
}

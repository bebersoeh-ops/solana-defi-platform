"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookA } from "lucide-react";

const TERMS: Array<{ term: string; def: string }> = [
  { term: "AMM", def: "Automated Market Maker. A liquidity pool that algorithmically prices assets without traditional order books." },
  { term: "Aggregator", def: "A system (like Jupiter) that scans many DEXes to find the best route and price for a swap." },
  { term: "ATA", def: "Associated Token Account. The on-chain account that holds an SPL token balance for a wallet." },
  { term: "Block", def: "A unit of transactions confirmed by the network at a given slot." },
  { term: "CLMM", def: "Concentrated Liquidity Market Maker. Liquidity is provided in price ranges instead of full curves." },
  { term: "DEX", def: "Decentralized Exchange. Trading happens via smart contracts instead of a centralized matching engine." },
  { term: "Finality", def: "When a transaction is irrevocable. On Solana this is ~32 slots after inclusion." },
  { term: "Impermanent Loss", def: "Unrealized loss vs. holding when LPing into a volatile pair." },
  { term: "Lamport", def: "1 / 1,000,000,000 of a SOL. Solana's smallest unit." },
  { term: "Liquidity", def: "Depth available at and around the current price; deeper liquidity = lower slippage." },
  { term: "MEV", def: "Maximal Extractable Value. Profit a block builder can extract by re-ordering transactions." },
  { term: "Mint", def: "An SPL token mint account; the unique on-chain identity of a token." },
  { term: "Priority Fee", def: "An optional bid in lamports to incentivize validators to include your tx in a block." },
  { term: "Route Plan", def: "The sequence of AMMs and percentages Jupiter uses to fulfill a swap." },
  { term: "Slippage", def: "Maximum acceptable price drift between quote and execution." },
  { term: "Slot", def: "A scheduled time window for a leader to produce a block on Solana." },
  { term: "SPL", def: "Solana Program Library standard for fungible tokens — Solana's analogue of ERC-20." },
  { term: "Versioned Transaction", def: "A newer transaction format that supports address lookup tables, used by Jupiter." },
];

export default function GlossaryPage() {
  const section = SECTIONS.find((s) => s.href === "/learn")!;
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      TERMS.filter((t) =>
        !q ? true : t.term.toLowerCase().includes(q.toLowerCase()) || t.def.toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  );
  return (
    <SectionShell
      title="DeFi Glossary"
      description="Plain-English definitions of the terms you'll see across Lumen and Solana DeFi."
      badge="A–Z"
      baseHref="/learn"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <BookA className="size-4 text-primary" /> Glossary
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search terms…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <CardDescription>{TERMS.length} terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((t) => (
              <div
                key={t.term}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/15 transition-colors"
              >
                <div className="text-sm font-semibold">{t.term}</div>
                <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{t.def}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

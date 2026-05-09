"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

const COLLECTIONS = [
  { name: "Mad Lads", floor: 142, count: 2, color: "from-fuchsia-500/40 to-purple-500/20" },
  { name: "DeGods", floor: 28, count: 1, color: "from-amber-500/40 to-orange-500/20" },
  { name: "Solana Monkey Business", floor: 64, count: 1, color: "from-emerald-500/40 to-teal-500/20" },
  { name: "Tensorians", floor: 4.6, count: 3, color: "from-sky-500/40 to-indigo-500/20" },
  { name: "y00ts (Sol)", floor: 12.3, count: 1, color: "from-rose-500/40 to-pink-500/20" },
  { name: "Famous Fox Federation", floor: 9.8, count: 5, color: "from-violet-500/40 to-purple-500/20" },
];

export default function NftOverviewPage() {
  const section = SECTIONS.find((s) => s.href === "/portfolio")!;
  const totalCount = useMemo(() => COLLECTIONS.reduce((s, c) => s + c.count, 0), []);
  const totalValue = useMemo(
    () => COLLECTIONS.reduce((s, c) => s + c.count * c.floor, 0),
    []
  );

  return (
    <SectionShell
      title="NFT Overview"
      description="A quick snapshot of NFTs across your tracked wallets. (Mock data)"
      badge={`${totalCount} NFTs`}
      baseHref="/portfolio"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Mini label="Total NFTs" value={String(totalCount)} />
            <Mini label="Floor value" value={`${totalValue.toFixed(2)} SOL`} />
            <Mini label="Collections" value={String(COLLECTIONS.length)} />
            <Mini label="Top collection" value={COLLECTIONS[0].name} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>Floor values are mock. No NFT calls made.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLLECTIONS.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-white/[0.06] overflow-hidden"
                >
                  <div className={`relative aspect-[4/3] bg-gradient-to-br ${c.color}`}>
                    <div className="absolute inset-0 grid-pattern opacity-20" />
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-[9px]">
                        {c.count} held
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-medium truncate">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">Floor {c.floor} SOL</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

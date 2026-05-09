import type { Metadata } from "next";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { MoversList } from "@/components/analytics/movers-list";

export const metadata: Metadata = { title: "Top Losers" };

export default function LosersPage() {
  const section = SECTIONS.find((s) => s.href === "/analytics")!;
  return (
    <SectionShell
      title="Top Losers"
      description="Largest 24h negative movers — useful for hunting bottoms or spotting weakness."
      badge="24h"
      baseHref="/analytics"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="size-4 text-rose-400" /> Losers
          </CardTitle>
          <CardDescription>Sorted by 24h % change descending</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <MoversList tone="losers" />
        </CardContent>
      </Card>
    </SectionShell>
  );
}

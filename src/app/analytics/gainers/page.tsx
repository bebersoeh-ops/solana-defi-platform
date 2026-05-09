import type { Metadata } from "next";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { MoversList } from "@/components/analytics/movers-list";

export const metadata: Metadata = { title: "Top Gainers" };

export default function GainersPage() {
  const section = SECTIONS.find((s) => s.href === "/analytics")!;
  return (
    <SectionShell
      title="Top Gainers"
      description="Largest 24h positive movers across the Jupiter token universe."
      badge="24h"
      baseHref="/analytics"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-emerald-400" /> Gainers
          </CardTitle>
          <CardDescription>Sorted by 24h % change</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <MoversList tone="gainers" />
        </CardContent>
      </Card>
    </SectionShell>
  );
}

"use client";

import { useMemo } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { UTILITY_SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

const ROUTES = ["/swap/v1/quote", "/swap/v1/swap", "/price/v2", "/tokens", "/program/upgrade"];
const STATUSES = [200, 200, 200, 200, 200, 429, 502, 200, 200];

export default function LogsPage() {
  const section = UTILITY_SECTIONS.find((s) => s.href === "/dashboard")!;
  const lines = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: `log-${i}`,
        time: Date.now() - i * 1500 * (1 + Math.random()),
        method: Math.random() > 0.6 ? "POST" : "GET",
        path: ROUTES[i % ROUTES.length],
        status: STATUSES[i % STATUSES.length],
        ms: Math.floor(40 + Math.random() * 280),
      })),
    []
  );
  return (
    <SectionShell
      title="API Logs"
      description="Recent calls to the Lumen API edge."
      badge="Live tail"
      baseHref="/dashboard"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="size-4 text-primary" /> Recent requests
          </CardTitle>
          <CardDescription>Mock data shown in dev</CardDescription>
        </CardHeader>
        <CardContent className="px-0 font-mono text-xs">
          <div className="divide-y divide-white/[0.04]">
            {lines.map((l) => (
              <div key={l.id} className="grid grid-cols-12 gap-2 px-5 py-1.5 hover:bg-white/[0.02]">
                <div className="col-span-2 text-muted-foreground">{formatRelativeTime(l.time)}</div>
                <div className="col-span-1">{l.method}</div>
                <div className="col-span-5 truncate">{l.path}</div>
                <div className="col-span-2 text-right">
                  <Badge
                    variant={l.status === 200 ? "success" : l.status >= 500 ? "destructive" : "warning"}
                    className="text-[9px]"
                  >
                    {l.status}
                  </Badge>
                </div>
                <div className="col-span-2 text-right text-muted-foreground tabular-nums">{l.ms}ms</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

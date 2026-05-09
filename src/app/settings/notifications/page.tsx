"use client";

import { SectionShell } from "@/components/shell/section-shell";
import { UTILITY_SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Activity, Wallet, Sparkles } from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import { useMounted } from "@/hooks/use-mounted";

export default function NotificationsSettingsPage() {
  const section = UTILITY_SECTIONS.find((s) => s.href === "/settings")!;
  const mounted = useMounted();
  const prefs = useUiStore((s) => s.notificationPrefs);
  const setPrefs = useUiStore((s) => s.setNotificationPrefs);

  return (
    <SectionShell
      title="Notifications"
      description="Choose which events surface to your in-app notification drawer."
      badge="In-app"
      baseHref="/settings"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-4 text-primary" /> Channels
            </CardTitle>
            <CardDescription>Toggle each event class.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row
              icon={<Activity className="size-4" />}
              label="Swap status"
              hint="Pending → confirmed transitions."
              value={mounted ? prefs.swap : true}
              onChange={(v) => setPrefs({ swap: v })}
            />
            <Row
              icon={<Wallet className="size-4" />}
              label="Wallet events"
              hint="Connect, disconnect, network change."
              value={mounted ? prefs.wallet : true}
              onChange={(v) => setPrefs({ wallet: v })}
            />
            <Row
              icon={<Sparkles className="size-4" />}
              label="Insights"
              hint="AI market panel updates."
              value={mounted ? prefs.insights : false}
              onChange={(v) => setPrefs({ insights: v })}
            />
            <Row
              icon={<BellOff className="size-4" />}
              label="Quiet mode"
              hint="Suppress all non-critical toasts."
              value={mounted ? prefs.quiet : false}
              onChange={(v) => setPrefs({ quiet: v })}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>What an event card looks like.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <PreviewToast title="Swap confirmed" body="0.5 SOL → 109.21 USDC · 0.4% impact" tone="success" />
            <PreviewToast title="Wallet connected" body="Phantom · 7Xb3…q9aP" tone="info" />
            <PreviewToast title="Insight" body="USDC depth dropped 18% on Phoenix in the last hour." tone="warning" />
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function Row({
  icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <div className="text-primary mt-0.5">{icon}</div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function PreviewToast({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: "success" | "info" | "warning";
}) {
  const c = {
    success: "border-emerald-500/30 bg-emerald-500/5",
    info: "border-sky-500/30 bg-sky-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
  } as const;
  return (
    <div className={`rounded-lg border ${c[tone]} px-3 py-2.5`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{body}</div>
    </div>
  );
}

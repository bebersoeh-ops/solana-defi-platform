import { SectionShell } from "@/components/shell/section-shell";
import { UTILITY_SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hash, Keyboard } from "lucide-react";

const SHORTCUTS: Array<{ keys: string[]; label: string }> = [
  { keys: ["⌘", "K"], label: "Open command palette" },
  { keys: ["⌘", "/"], label: "Toggle sidebar" },
  { keys: ["g", "h"], label: "Go to homepage" },
  { keys: ["g", "t"], label: "Go to Trade" },
  { keys: ["g", "p"], label: "Go to Portfolio" },
  { keys: ["g", "a"], label: "Go to Analytics" },
  { keys: ["g", "w"], label: "Go to Wallet Tools" },
  { keys: ["g", "l"], label: "Go to Learn" },
  { keys: ["S"], label: "Open quick swap" },
  { keys: ["F"], label: "Toggle favorite token" },
  { keys: ["?"], label: "Show keyboard help" },
  { keys: ["Esc"], label: "Close any modal" },
];

export default function ShortcutsPage() {
  const section = UTILITY_SECTIONS.find((s) => s.href === "/settings")!;
  return (
    <SectionShell
      title="Keyboard Shortcuts"
      description="Navigate Lumen at the speed of thought."
      badge="Productivity"
      baseHref="/settings"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="size-4 text-primary" /> Shortcuts
          </CardTitle>
          <CardDescription>Note: implementation may vary by OS — ⌘ = Ctrl on Windows/Linux.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SHORTCUTS.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
              >
                <span className="text-xs flex items-center gap-1.5">
                  <Hash className="size-3 text-muted-foreground" /> {s.label}
                </span>
                <span className="flex items-center gap-1">
                  {s.keys.map((k, i) => (
                    <kbd
                      key={i}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

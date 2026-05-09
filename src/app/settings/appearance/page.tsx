"use client";

import { SectionShell } from "@/components/shell/section-shell";
import { UTILITY_SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useUiStore, type AccentTheme } from "@/store/ui-store";
import { Sparkles, Palette, Wind, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

const ACCENTS: Array<{ id: AccentTheme; label: string; sample: string }> = [
  { id: "mint", label: "Mint", sample: "from-emerald-300 to-teal-500" },
  { id: "purple", label: "Purple", sample: "from-fuchsia-400 to-violet-600" },
  { id: "blue", label: "Blue", sample: "from-sky-400 to-indigo-600" },
  { id: "pink", label: "Pink", sample: "from-pink-400 to-rose-600" },
  { id: "orange", label: "Orange", sample: "from-amber-400 to-orange-600" },
];

export default function AppearancePage() {
  const section = UTILITY_SECTIONS.find((s) => s.href === "/settings")!;
  const mounted = useMounted();
  const accent = useUiStore((s) => s.accent);
  const setAccent = useUiStore((s) => s.setAccent);
  const reduceMotion = useUiStore((s) => s.reduceMotion);
  const setReduceMotion = useUiStore((s) => s.setReduceMotion);
  const compact = useUiStore((s) => s.compactMode);
  const setCompact = useUiStore((s) => s.setCompactMode);
  const grid = useUiStore((s) => s.showGrid);
  const setGrid = useUiStore((s) => s.setShowGrid);

  return (
    <SectionShell
      title="Appearance"
      description="Customize accent color, density, and motion preferences."
      badge="Theme"
      baseHref="/settings"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-4 text-primary" /> Accent color
            </CardTitle>
            <CardDescription>Used for highlights, charts and CTAs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAccent(a.id)}
                  className={cn(
                    "rounded-xl border h-20 flex flex-col items-center justify-center gap-1 transition-colors",
                    mounted && accent === a.id
                      ? "border-primary/40 ring-1 ring-primary/30"
                      : "border-white/[0.06] hover:border-white/15"
                  )}
                >
                  <span className={`size-7 rounded-full bg-gradient-to-br ${a.sample}`} />
                  <span className="text-[10px]">{a.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Motion + density
            </CardTitle>
            <CardDescription>Tame the UI to your taste.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              icon={<Wind className="size-4" />}
              label="Reduce motion"
              hint="Disable non-essential animations."
              checked={mounted ? reduceMotion : false}
              onChange={setReduceMotion}
            />
            <ToggleRow
              icon={<Layers className="size-4" />}
              label="Compact mode"
              hint="Tighter spacing, more dense data."
              checked={mounted ? compact : false}
              onChange={setCompact}
            />
            <ToggleRow
              icon={<Sparkles className="size-4" />}
              label="Background grid"
              hint="Subtle cyberpunk grid behind sections."
              checked={mounted ? grid : true}
              onChange={setGrid}
            />
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
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
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

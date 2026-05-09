"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useSwapStore } from "@/store/swap-store";
import { SLIPPAGE_PRESETS, PRIORITY_FEE_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SwapSettingsPanel() {
  const [open, setOpen] = useState(false);
  const slippageBps = useSwapStore((s) => s.slippageBps);
  const setSlippageBps = useSwapStore((s) => s.setSlippageBps);
  const priorityFee = useSwapStore((s) => s.priorityFee);
  const setPriorityFee = useSwapStore((s) => s.setPriorityFee);
  const expert = useSwapStore((s) => s.expertMode);
  const setExpert = useSwapStore((s) => s.setExpertMode);

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="text-muted-foreground"
      >
        <Settings2 className="size-4" />
        <span className="hidden sm:inline">{(slippageBps / 100).toFixed(2)}%</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="p-5 space-y-5">
            <div>
              <div className="text-base font-semibold">Swap settings</div>
              <p className="text-xs text-muted-foreground">
                Tune execution parameters. Changes persist across sessions.
              </p>
            </div>

            <Section
              title="Slippage tolerance"
              hint="Max accepted price movement before transaction reverts."
            >
              <div className="grid grid-cols-4 gap-2">
                {SLIPPAGE_PRESETS.map((bps) => (
                  <button
                    key={bps}
                    type="button"
                    onClick={() => setSlippageBps(bps)}
                    className={cn(
                      "rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors",
                      slippageBps === bps
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/[0.06] hover:border-white/15"
                    )}
                  >
                    {(bps / 100).toFixed(2)}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                max={50}
                step={0.01}
                placeholder="Custom %"
                value={(slippageBps / 100).toFixed(2)}
                onChange={(e) =>
                  setSlippageBps(Math.max(1, Math.round(Number(e.target.value) * 100)))
                }
                className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm focus:outline-none focus:border-primary/40"
              />
            </Section>

            <Section title="Priority fee" hint="Boost inclusion in congested blocks.">
              <div className="grid grid-cols-3 gap-2">
                {PRIORITY_FEE_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriorityFee(p.value)}
                    className={cn(
                      "rounded-lg border px-2.5 py-2 text-left transition-colors",
                      priorityFee === p.value
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/[0.06] hover:border-white/15"
                    )}
                  >
                    <div className="text-xs font-medium">{p.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {p.description}
                    </div>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Expert mode" hint="Reveals advanced execution toggles.">
              <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <div>
                  <div className="text-xs font-medium">Show expert controls</div>
                  <div className="text-[10px] text-muted-foreground">
                    Adds MEV simulation, exclude DEXes, custom priority lamports.
                  </div>
                </div>
                <Switch checked={expert} onCheckedChange={setExpert} />
              </div>
            </Section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <div className="text-xs font-medium">{title}</div>
        {hint ? <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

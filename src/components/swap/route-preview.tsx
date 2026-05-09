"use client";

import { ChevronRight, Layers } from "lucide-react";
import type { JupiterQuoteResponse } from "@/lib/types";
import { findToken } from "@/lib/tokens";
import { TokenIcon } from "@/components/shared/token-icon";

export function RoutePreview({ quote }: { quote: JupiterQuoteResponse }) {
  const steps = quote.routePlan ?? [];
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
        <span className="inline-flex items-center gap-1.5">
          <Layers className="size-3" />
          Route plan
        </span>
        <span>{steps.length} hop{steps.length > 1 ? "s" : ""}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {steps.map((s, i) => {
          const inTok = findToken(s.swapInfo.inputMint);
          const outTok = findToken(s.swapInfo.outputMint);
          return (
            <div key={`${s.swapInfo.ammKey}-${i}`} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1">
                <TokenIcon
                  src={inTok?.logoURI}
                  symbol={inTok?.symbol}
                  size={14}
                />
                <span className="font-medium">{inTok?.symbol ?? "?"}</span>
                <span className="text-muted-foreground">→</span>
                <TokenIcon
                  src={outTok?.logoURI}
                  symbol={outTok?.symbol}
                  size={14}
                />
                <span className="font-medium">{outTok?.symbol ?? "?"}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-primary">{s.swapInfo.label}</span>
                {s.percent !== undefined && (
                  <span className="text-muted-foreground/70">{s.percent}%</span>
                )}
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="size-3 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

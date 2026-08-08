"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TokenSelect } from "@/components/swap/token-select";
import { SOL_MINT, USDC_MINT } from "@/lib/constants";
import { useJupiterQuote } from "@/hooks/use-jupiter-quote";
import { useToken } from "@/hooks/use-token";
import { useDebounced } from "@/hooks/use-debounced";
import { calcOutputAmount } from "@/lib/jupiter";
import { Route as RouteIcon, Loader2, Cpu, Layers } from "lucide-react";
import { RoutePreview } from "@/components/swap/route-preview";

export default function RouteAnalyzerPage() {
  const section = SECTIONS.find((s) => s.href === "/trade")!;
  const [input, setInput] = useState(SOL_MINT);
  const [output, setOutput] = useState(USDC_MINT);
  const [amount, setAmount] = useState("1");
  const debouncedAmount = useDebounced(amount, 500);
  const inTok = useToken(input);
  const outTok = useToken(output);
  const num = parseFloat(debouncedAmount || "0");

  const { quote, loading, error } = useJupiterQuote({
    inputMint: input,
    outputMint: output,
    amount: num,
    inputDecimals: inTok?.decimals ?? 9,
    slippageBps: 50,
    enabled: num > 0,
  });

  const out = useMemo(
    () => (quote && outTok ? calcOutputAmount(quote, outTok.decimals) : 0),
    [quote, outTok]
  );

  return (
    <SectionShell
      title="Route Analyzer"
      description="Inspect every hop, AMM and percentage split for any pair. Hooks directly into Jupiter's quote API."
      badge="Live"
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RouteIcon className="size-4 text-primary" />
              Inputs
            </CardTitle>
            <CardDescription>Quote auto-refreshes as you type.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Input">
              <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-0 p-0 h-7 text-base"
                />
                <TokenSelect value={input} onChange={setInput} exclude={output} />
              </div>
            </Field>
            <Field label="Output">
              <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <div className="text-base font-medium tabular-nums">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : out.toFixed(6)}
                </div>
                <TokenSelect value={output} onChange={setOutput} exclude={input} />
              </div>
            </Field>
            {error ? (
              <div className="text-xs text-rose-400">{error}</div>
            ) : null}
            <Button variant="gradient" className="w-full">
              Snapshot route
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              Route plan
            </CardTitle>
            <CardDescription>
              {quote?.routePlan?.length
                ? `${quote.routePlan.length} hop${quote.routePlan.length > 1 ? "s" : ""} · ${quote.contextSlot ? `slot ${quote.contextSlot}` : ""}`
                : "Enter amount to fetch a route"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quote ? (
              <>
                <RoutePreview quote={quote} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <Mini label="In amount" value={amount} />
                  <Mini label="Out amount" value={out.toFixed(6)} />
                  <Mini
                    label="Price impact"
                    value={`${(Number(quote.priceImpactPct ?? 0) * 100).toFixed(3)}%`}
                  />
                  <Mini label="Slippage" value="0.50%" />
                </div>
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] divide-y divide-white/[0.03]">
                  {quote.routePlan?.map((step, i) => (
                    <div key={i} className="px-3 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="size-5 rounded-md bg-white/[0.04] grid place-items-center font-mono text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-medium">{step.swapInfo.label}</span>
                      </div>
                      <div className="text-muted-foreground font-mono">
                        {step.percent ?? 100}% · fee {step.swapInfo.feeAmount ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-white/[0.08] py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <Cpu className="size-5" />
                Awaiting input…
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">
        {label}
      </div>
      {children}
    </label>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</div>
      <div className="mt-1 font-mono">{value}</div>
    </div>
  );
}

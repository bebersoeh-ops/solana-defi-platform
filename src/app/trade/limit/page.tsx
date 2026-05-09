"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Clock } from "lucide-react";
import { TokenSelect } from "@/components/swap/token-select";
import { SOL_MINT, USDC_MINT } from "@/lib/constants";
import { findToken } from "@/lib/tokens";

export default function LimitPreviewPage() {
  const section = SECTIONS.find((s) => s.href === "/trade")!;
  const [pay, setPay] = useState(SOL_MINT);
  const [receive, setReceive] = useState(USDC_MINT);
  const [amount, setAmount] = useState("1");
  const [target, setTarget] = useState("180");

  const payTok = findToken(pay);
  const recTok = findToken(receive);

  const orders = useMemo(
    () => [
      { id: "lim-1", pair: "SOL → USDC", target: "190.50", amount: "2.0", status: "open", age: "12m" },
      { id: "lim-2", pair: "JUP → USDC", target: "1.18", amount: "120", status: "filled", age: "1h" },
      { id: "lim-3", pair: "BONK → USDC", target: "0.000022", amount: "8M", status: "expired", age: "5h" },
    ],
    []
  );

  return (
    <SectionShell
      title="Limit Preview"
      description="Plan limit-style orders against Jupiter routes. (Demo preview — execution simulated.)"
      badge="Demo · preview"
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crosshair className="size-4 text-primary" />
              Plan limit order
            </CardTitle>
            <CardDescription>Orders are simulated. Hook your own keeper for real fills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Sell</div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent border-0 text-2xl font-semibold p-0 h-8"
                />
                <TokenSelect value={pay} onChange={setPay} exclude={receive} />
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">
                Target {recTok?.symbol} / {payTok?.symbol}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent border-0 text-2xl font-semibold p-0 h-8"
                />
                <TokenSelect value={receive} onChange={setReceive} exclude={pay} />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground rounded-lg border border-dashed border-white/10 px-3 py-2">
              Lumen does not custody limit orders. To run actual limit orders, wire a
              keeper bot or integrate Jupiter's keeper APIs.
            </div>
            <Button variant="gradient" className="w-full">
              Save limit (demo)
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4 text-fuchsia-300" />
              Active demo orders
            </CardTitle>
            <CardDescription>Mock open / filled / expired limit orders for UI preview.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                  <tr>
                    <th className="text-left px-5 py-2 font-medium">Order</th>
                    <th className="text-left px-2 py-2 font-medium">Pair</th>
                    <th className="text-right px-2 py-2 font-medium">Amount</th>
                    <th className="text-right px-2 py-2 font-medium">Target</th>
                    <th className="text-right px-2 py-2 font-medium">Age</th>
                    <th className="text-right px-5 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-white/[0.03]">
                      <td className="px-5 py-2.5 font-mono text-xs">{o.id}</td>
                      <td className="px-2 py-2.5">{o.pair}</td>
                      <td className="px-2 py-2.5 text-right">{o.amount}</td>
                      <td className="px-2 py-2.5 text-right font-mono">{o.target}</td>
                      <td className="px-2 py-2.5 text-right text-muted-foreground">{o.age}</td>
                      <td className="px-5 py-2.5 text-right">
                        <Badge
                          variant={
                            o.status === "filled"
                              ? "success"
                              : o.status === "open"
                                ? "info"
                                : "secondary"
                          }
                          className="text-[9px]"
                        >
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

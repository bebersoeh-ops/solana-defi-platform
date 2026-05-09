"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Calendar, Clock, Info, Loader2, Sparkles, Trash2, Wallet as WalletIcon } from "lucide-react";

import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenSelect } from "@/components/swap/token-select";
import { SOL_MINT, USDC_MINT } from "@/lib/constants";
import { findToken } from "@/lib/tokens";
import { useTokenBalance } from "@/hooks/use-token-balance";
import {
  cancelRecurringOrder,
  createRecurringOrder,
  fetchRecurringOrders,
  type RecurringOrder,
} from "@/lib/jupiter";
import { formatNumber, generateId } from "@/lib/utils";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (m) => m.WalletMultiButton,
    ),
  { ssr: false },
);

const INTERVAL_PRESETS: Array<{ label: string; seconds: number }> = [
  { label: "Hourly", seconds: 3600 },
  { label: "Daily", seconds: 86_400 },
  { label: "Weekly", seconds: 604_800 },
];

const MIN_USD_PER_ORDER = 50;

export default function DcaPage() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [inputMint, setInputMint] = useState(USDC_MINT);
  const [outputMint, setOutputMint] = useState(SOL_MINT);
  const [totalDeposit, setTotalDeposit] = useState("100");
  const [numberOfOrders, setNumberOfOrders] = useState("4");
  const [interval, setIntervalSeconds] = useState(86_400);

  const [orders, setOrders] = useState<RecurringOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const inputToken = findToken(inputMint);
  const outputToken = findToken(outputMint);

  const balance = useTokenBalance(connected ? inputMint : null);

  const numTotal = parseFloat(totalDeposit || "0");
  const numCycles = Math.max(2, Math.floor(parseFloat(numberOfOrders || "0") || 0));
  const perCycle = numCycles > 0 ? numTotal / numCycles : 0;
  const insufficient = connected && balance.hasLoaded && numTotal > balance.amount;

  useEffect(() => {
    if (!publicKey) {
      setOrders([]);
      return;
    }
    const ctrl = new AbortController();
    let cancelled = false;
    async function load() {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const resp = await fetchRecurringOrders({
          user: publicKey!.toBase58(),
          orderStatus: "active",
          signal: ctrl.signal,
        });
        if (cancelled) return;
        setOrders(resp.time);
      } catch (e) {
        if (cancelled) return;
        setOrdersError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    }
    load();
    const t = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      ctrl.abort();
      window.clearInterval(t);
    };
  }, [publicKey]);

  async function handleCreate() {
    if (!connected || !publicKey || !signTransaction) {
      toast.error("Connect a wallet that supports tx signing");
      return;
    }
    if (!inputToken || !outputToken) {
      toast.error("Token metadata missing");
      return;
    }
    if (numTotal <= 0 || numCycles < 2) {
      toast.error("Total deposit and orders count must be valid (min 2 orders)");
      return;
    }
    if (insufficient) {
      toast.error(
        `Insufficient ${inputToken.symbol} — you have ${formatNumber(balance.amount, 4)}`,
      );
      return;
    }
    const id = generateId("dca");
    setSubmitting(true);
    toast.loading("Building DCA order…", { id });
    try {
      const inAmountRaw = Math.floor(numTotal * Math.pow(10, inputToken.decimals));
      const built = await createRecurringOrder({
        user: publicKey.toBase58(),
        inputMint,
        outputMint,
        inAmount: inAmountRaw,
        numberOfOrders: numCycles,
        intervalSeconds: interval,
      });

      const txBytes = Uint8Array.from(atob(built.transaction), (c) =>
        c.charCodeAt(0),
      );
      const tx = VersionedTransaction.deserialize(txBytes);

      toast.loading("Awaiting wallet signature…", { id });
      const signed = await signTransaction(tx);

      toast.loading("Broadcasting…", { id });
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      const latest = await connection.getLatestBlockhash("confirmed");
      const conf = await connection.confirmTransaction(
        {
          signature,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight,
        },
        "confirmed",
      );

      if (conf.value.err) {
        toast.error("DCA create failed on-chain", {
          id,
          description: JSON.stringify(conf.value.err).slice(0, 140),
        });
      } else {
        toast.success(
          `DCA created · ${perCycle.toFixed(2)} ${inputToken.symbol} every ${formatInterval(interval)}`,
          {
            id,
            description: signature.slice(0, 12) + "…",
            action: {
              label: "View",
              onClick: () =>
                window.open(`https://solscan.io/tx/${signature}`, "_blank"),
            },
          },
        );
        // Refresh orders shortly after.
        setTimeout(() => {
          if (publicKey) {
            fetchRecurringOrders({
              user: publicKey.toBase58(),
              orderStatus: "active",
            })
              .then((r) => setOrders(r.time))
              .catch(() => {});
          }
        }, 2000);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error("DCA aborted", { id, description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(orderKey: string) {
    if (!connected || !publicKey || !signTransaction) return;
    const id = `cancel-${orderKey.slice(0, 8)}`;
    setCancelling(orderKey);
    toast.loading("Cancelling DCA…", { id });
    try {
      const built = await cancelRecurringOrder({
        user: publicKey.toBase58(),
        recurringType: "time",
        order: orderKey,
      });
      const txBytes = Uint8Array.from(atob(built.transaction), (c) =>
        c.charCodeAt(0),
      );
      const tx = VersionedTransaction.deserialize(txBytes);
      const signed = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(signed.serialize());
      const latest = await connection.getLatestBlockhash("confirmed");
      const conf = await connection.confirmTransaction(
        {
          signature,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight,
        },
        "confirmed",
      );
      if (conf.value.err) {
        toast.error("Cancel failed", { id });
      } else {
        toast.success("DCA cancelled", {
          id,
          description: signature.slice(0, 12) + "…",
        });
        setOrders((cur) => cur.filter((o) => o.orderKey !== orderKey));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error("Cancel aborted", { id, description: msg });
    } finally {
      setCancelling(null);
    }
  }

  const minUsdMessage =
    perCycle > 0 && perCycle < MIN_USD_PER_ORDER && inputToken?.tags?.includes("stablecoin")
      ? `Per-cycle amount is ~$${perCycle.toFixed(2)} but Jupiter requires ≥ $${MIN_USD_PER_ORDER}.`
      : null;

  return (
    <SectionShell
      title="DCA · Recurring Swaps"
      description="Schedule on-chain dollar-cost-average orders via Jupiter Recurring v1. Funds deposit into a Jupiter PDA; the keeper executes each cycle automatically."
      badge={connected ? "Live · Jupiter recurring" : "Live · Jupiter recurring · connect wallet"}
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Create DCA
            </CardTitle>
            <CardDescription>
              Deposit upfront, Jupiter splits into N orders that swap at your
              chosen interval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="You deposit">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 flex items-center gap-2">
                <Input
                  type="number"
                  value={totalDeposit}
                  onChange={(e) => setTotalDeposit(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent border-0 text-2xl font-semibold p-0 h-8"
                />
                <TokenSelect value={inputMint} onChange={setInputMint} exclude={outputMint} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 flex justify-between">
                <span>
                  Balance:{" "}
                  {connected
                    ? balance.hasLoaded
                      ? formatNumber(balance.amount, 4)
                      : "loading…"
                    : "—"}
                </span>
                {insufficient && (
                  <span className="text-rose-400">Insufficient {inputToken?.symbol}</span>
                )}
              </div>
            </Field>

            <Field label="To buy">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 flex items-center justify-end">
                <TokenSelect value={outputMint} onChange={setOutputMint} exclude={inputMint} />
              </div>
            </Field>

            <Field label="Number of orders">
              <Input
                type="number"
                min={2}
                value={numberOfOrders}
                onChange={(e) => setNumberOfOrders(e.target.value)}
              />
              <div className="text-[10px] text-muted-foreground mt-1">
                Each cycle ≈ {formatNumber(perCycle, 4)} {inputToken?.symbol}
              </div>
            </Field>

            <Field label="Interval">
              <div className="grid grid-cols-3 gap-1.5">
                {INTERVAL_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setIntervalSeconds(p.seconds)}
                    className={`text-xs rounded-md border px-2 py-1.5 transition-colors ${
                      interval === p.seconds
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>

            {minUsdMessage && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-200 flex items-start gap-2">
                <Info className="size-3.5 mt-0.5 shrink-0" />
                <span>{minUsdMessage}</span>
              </div>
            )}

            <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] divide-y divide-white/[0.04]">
              <Row label="Per cycle" value={`${formatNumber(perCycle, 4)} ${inputToken?.symbol}`} />
              <Row label="Interval" value={formatInterval(interval)} />
              <Row label="Total cycles" value={String(numCycles)} />
              <Row
                label="Total runtime"
                value={formatInterval(interval * numCycles)}
              />
            </div>

            {connected ? (
              <Button
                size="xl"
                variant="gradient"
                className="w-full"
                disabled={submitting || numTotal <= 0 || insufficient}
                onClick={handleCreate}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating DCA…
                  </>
                ) : insufficient ? (
                  `Insufficient ${inputToken?.symbol ?? ""}`
                ) : (
                  <>
                    <Calendar className="size-4" />
                    Create DCA on-chain
                  </>
                )}
              </Button>
            ) : (
              <WalletMultiButton
                style={{
                  width: "100%",
                  background: "linear-gradient(120deg, hsl(var(--primary)), hsl(var(--accent)))",
                  color: "hsl(var(--background))",
                  borderRadius: 10,
                  height: 48,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  justifyContent: "center",
                  border: "none",
                }}
              >
                <WalletIcon className="size-4" />
                Connect wallet
              </WalletMultiButton>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4 text-fuchsia-300" />
              Active recurring orders
            </CardTitle>
            <CardDescription>
              {connected
                ? "Your live DCA positions on Jupiter Recurring v1. Refreshes every 30s."
                : "Connect your wallet to load on-chain recurring orders."}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {!connected ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                Wallet not connected.
              </div>
            ) : ordersLoading && orders.length === 0 ? (
              <div className="px-6 py-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : ordersError ? (
              <div className="mx-6 my-2 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300 flex items-start gap-2">
                <Info className="size-3.5 mt-0.5 shrink-0" />
                <span className="break-all">{ordersError}</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No active DCA orders. Create one on the left to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                    <tr>
                      <th className="text-left px-5 py-2 font-medium">Order</th>
                      <th className="text-left px-2 py-2 font-medium">Pair</th>
                      <th className="text-right px-2 py-2 font-medium">Per cycle</th>
                      <th className="text-right px-2 py-2 font-medium">Cycle</th>
                      <th className="text-right px-2 py-2 font-medium">Filled / Total</th>
                      <th className="text-right px-5 py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const inTok = findToken(o.inputMint);
                      const outTok = findToken(o.outputMint);
                      const inDec = inTok?.decimals ?? 0;
                      const perCycleUi = inDec
                        ? Number(o.inAmountPerCycle) / Math.pow(10, inDec)
                        : 0;
                      const cycleSec = Number(o.cycleFrequency || "0");
                      return (
                        <tr key={o.orderKey} className="border-b border-white/[0.03]">
                          <td className="px-5 py-2.5 font-mono text-[10px]">
                            <a
                              className="hover:text-foreground"
                              href={`https://solscan.io/account/${o.orderKey}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {o.orderKey.slice(0, 6)}…{o.orderKey.slice(-4)}
                            </a>
                          </td>
                          <td className="px-2 py-2.5">
                            {inTok?.symbol ?? short(o.inputMint)} → {outTok?.symbol ?? short(o.outputMint)}
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono">
                            {formatNumber(perCycleUi, 4)} {inTok?.symbol ?? ""}
                          </td>
                          <td className="px-2 py-2.5 text-right text-muted-foreground">
                            {cycleSec ? formatInterval(cycleSec) : "—"}
                          </td>
                          <td className="px-2 py-2.5 text-right">
                            <Badge variant="info" className="text-[9px]">
                              {Number(o.inUsed || 0) > 0 ? "running" : "queued"}
                            </Badge>
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={cancelling === o.orderKey}
                              onClick={() => handleCancel(o.orderKey)}
                            >
                              {cancelling === o.orderKey ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Trash2 className="size-3" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground/70 mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground/90 font-mono">{value}</span>
    </div>
  );
}

function formatInterval(seconds: number): string {
  if (seconds % 604_800 === 0) {
    const w = seconds / 604_800;
    return `${w}w`;
  }
  if (seconds % 86_400 === 0) {
    const d = seconds / 86_400;
    return `${d}d`;
  }
  if (seconds % 3600 === 0) {
    const h = seconds / 3600;
    return `${h}h`;
  }
  if (seconds % 60 === 0) {
    return `${seconds / 60}m`;
  }
  return `${seconds}s`;
}

function short(addr: string): string {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

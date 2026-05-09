"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Crosshair,
  Info,
  Loader2,
  Target,
  Trash2,
  Wallet as WalletIcon,
} from "lucide-react";

import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenSelect } from "@/components/swap/token-select";
import { SOL_MINT, USDC_MINT } from "@/lib/constants";
import { useToken, useTokenLookup } from "@/hooks/use-token";
import { useTokenBalance } from "@/hooks/use-token-balance";
import {
  cancelTriggerOrder,
  createTriggerOrder,
  fetchTriggerOrders,
  getPrices,
  type TriggerOrder,
} from "@/lib/jupiter";
import { formatNumber, formatPrice, generateId } from "@/lib/utils";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (m) => m.WalletMultiButton,
    ),
  { ssr: false },
);

const EXPIRY_PRESETS: Array<{ label: string; seconds: number | null }> = [
  { label: "1h", seconds: 3600 },
  { label: "24h", seconds: 86_400 },
  { label: "7d", seconds: 604_800 },
  { label: "Never", seconds: null },
];

export default function LimitPage() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [inputMint, setInputMint] = useState(SOL_MINT);
  const [outputMint, setOutputMint] = useState(USDC_MINT);
  const [sellAmount, setSellAmount] = useState("0.5");
  const [targetPrice, setTargetPrice] = useState("");
  const [expiry, setExpiry] = useState<number | null>(86_400);

  const [orders, setOrders] = useState<TriggerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);

  const inputToken = useToken(inputMint);
  const outputToken = useToken(outputMint);
  const lookup = useTokenLookup();

  const balance = useTokenBalance(connected ? inputMint : null);

  const sell = parseFloat(sellAmount || "0");
  const target = parseFloat(targetPrice || "0");
  const insufficient = connected && balance.hasLoaded && sell > balance.amount;
  const receive = sell > 0 && target > 0 ? sell * target : 0;

  // Live market mid (Jupiter price API) used as a hint above the price input.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prices = await getPrices([inputMint, outputMint]);
        if (cancelled) return;
        const inUsd = prices[inputMint]?.usdPrice;
        const outUsd = prices[outputMint]?.usdPrice;
        if (inUsd && outUsd && outUsd > 0) {
          const mid = inUsd / outUsd;
          setMarketPrice(mid);
          if (!targetPrice) {
            setTargetPrice(mid.toFixed(mid >= 1 ? 2 : 6));
          }
        } else {
          setMarketPrice(null);
        }
      } catch {
        if (!cancelled) setMarketPrice(null);
      }
    })();
    return () => {
      cancelled = true;
    };
    // We intentionally only refresh market mid when the pair changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMint, outputMint]);

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
        const resp = await fetchTriggerOrders({
          user: publicKey!.toBase58(),
          orderStatus: "active",
          signal: ctrl.signal,
        });
        if (cancelled) return;
        setOrders(resp.orders);
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
    if (sell <= 0 || target <= 0) {
      toast.error("Enter a positive sell amount and target price");
      return;
    }
    if (insufficient) {
      toast.error(
        `Insufficient ${inputToken.symbol} — you have ${formatNumber(balance.amount, 4)}`,
      );
      return;
    }

    const id = generateId("limit");
    setSubmitting(true);
    toast.loading("Building limit order…", { id });
    try {
      const makingRaw = Math.floor(sell * Math.pow(10, inputToken.decimals));
      const takingRaw = Math.floor(receive * Math.pow(10, outputToken.decimals));
      if (makingRaw <= 0 || takingRaw <= 0) {
        throw new Error("Resolved amounts are zero — increase sell amount or price");
      }

      const expiredAt =
        expiry !== null ? Math.floor(Date.now() / 1000) + expiry : undefined;

      const built = await createTriggerOrder({
        inputMint,
        outputMint,
        maker: publicKey.toBase58(),
        payer: publicKey.toBase58(),
        makingAmount: makingRaw,
        takingAmount: takingRaw,
        expiredAt,
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
        toast.error("Limit create failed on-chain", {
          id,
          description: JSON.stringify(conf.value.err).slice(0, 140),
        });
      } else {
        toast.success(
          `Limit · sell ${formatNumber(sell, 4)} ${inputToken.symbol} @ ${target}`,
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
        setTimeout(() => {
          if (publicKey) {
            fetchTriggerOrders({
              user: publicKey.toBase58(),
              orderStatus: "active",
            })
              .then((r) => setOrders(r.orders))
              .catch(() => {});
          }
        }, 2000);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error("Limit aborted", { id, description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(orderKey: string) {
    if (!connected || !publicKey || !signTransaction) return;
    const id = `cancel-${orderKey.slice(0, 8)}`;
    setCancelling(orderKey);
    toast.loading("Cancelling limit…", { id });
    try {
      const built = await cancelTriggerOrder({
        maker: publicKey.toBase58(),
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
        toast.success("Limit cancelled", {
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

  const distanceFromMarket = useMemo(() => {
    if (!marketPrice || !target) return null;
    return ((target - marketPrice) / marketPrice) * 100;
  }, [marketPrice, target]);

  return (
    <SectionShell
      title="Limit Orders"
      description="On-chain trigger orders via Jupiter Trigger v1. Funds lock in a Jupiter PDA; the keeper fills your order automatically when the market hits your target."
      badge={connected ? "Live · Jupiter trigger" : "Live · Jupiter trigger · connect wallet"}
      baseHref="/trade"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              Place limit order
            </CardTitle>
            <CardDescription>
              Sell {inputToken?.symbol} for {outputToken?.symbol} when price
              hits your target.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Sell">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 flex items-center gap-2">
                <Input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
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

            <Field label="Buy">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 flex items-center justify-end">
                <TokenSelect value={outputMint} onChange={setOutputMint} exclude={inputMint} />
              </div>
            </Field>

            <Field
              label={`Price (${outputToken?.symbol ?? "out"} per 1 ${inputToken?.symbol ?? "in"})`}
            >
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent border-0 text-xl font-semibold p-0 h-7"
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 flex justify-between">
                <span>
                  Market{" "}
                  {marketPrice
                    ? formatPrice(marketPrice)
                    : "…"}
                </span>
                {distanceFromMarket !== null && (
                  <span
                    className={
                      distanceFromMarket >= 0 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {distanceFromMarket >= 0 ? "+" : ""}
                    {distanceFromMarket.toFixed(2)}% vs mid
                  </span>
                )}
              </div>
            </Field>

            <Field label="Expires in">
              <div className="grid grid-cols-4 gap-1.5">
                {EXPIRY_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setExpiry(p.seconds)}
                    className={`text-xs rounded-md border px-2 py-1.5 transition-colors ${
                      expiry === p.seconds
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>

            <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] divide-y divide-white/[0.04]">
              <Row
                label="You sell"
                value={`${formatNumber(sell, 6)} ${inputToken?.symbol}`}
              />
              <Row
                label="You receive"
                value={`${formatNumber(receive, 6)} ${outputToken?.symbol}`}
              />
              <Row label="Expiry" value={expiry === null ? "Never" : prettyExpiry(expiry)} />
            </div>

            {connected ? (
              <Button
                size="xl"
                variant="gradient"
                className="w-full"
                disabled={submitting || sell <= 0 || target <= 0 || insufficient}
                onClick={handleCreate}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Placing limit…
                  </>
                ) : insufficient ? (
                  `Insufficient ${inputToken?.symbol ?? ""}`
                ) : (
                  <>
                    <Crosshair className="size-4" />
                    Place limit on-chain
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
              <Crosshair className="size-4 text-fuchsia-300" />
              Active limit orders
            </CardTitle>
            <CardDescription>
              {connected
                ? "Your live trigger orders on Jupiter. Refreshes every 30s."
                : "Connect your wallet to load on-chain trigger orders."}
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
                No active limit orders. Place one on the left.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                    <tr>
                      <th className="text-left px-5 py-2 font-medium">Order</th>
                      <th className="text-left px-2 py-2 font-medium">Pair</th>
                      <th className="text-right px-2 py-2 font-medium">Sell</th>
                      <th className="text-right px-2 py-2 font-medium">Buy</th>
                      <th className="text-right px-2 py-2 font-medium">Price</th>
                      <th className="text-right px-2 py-2 font-medium">Expires</th>
                      <th className="text-right px-5 py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const inTok = lookup(o.inputMint);
                      const outTok = lookup(o.outputMint);
                      const inDec = inTok?.decimals ?? 0;
                      const outDec = outTok?.decimals ?? 0;
                      const sellUi = inDec
                        ? Number(o.makingAmount) / Math.pow(10, inDec)
                        : 0;
                      const buyUi = outDec
                        ? Number(o.takingAmount) / Math.pow(10, outDec)
                        : 0;
                      const price = sellUi > 0 ? buyUi / sellUi : 0;
                      const exp = o.expiredAt ? Number(o.expiredAt) : null;
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
                            {formatNumber(sellUi, 4)}
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono">
                            {formatNumber(buyUi, 4)}
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono">
                            {formatPrice(price)}
                          </td>
                          <td className="px-2 py-2.5 text-right text-muted-foreground">
                            {exp ? <Badge variant="info" className="text-[9px]">{prettyTimeUntil(exp)}</Badge> : "—"}
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

function prettyExpiry(seconds: number): string {
  if (seconds % 86_400 === 0) return `${seconds / 86_400}d`;
  if (seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

function prettyTimeUntil(unixSec: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = unixSec - now;
  if (diff <= 0) return "expired";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86_400)}d`;
}

function short(addr: string): string {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

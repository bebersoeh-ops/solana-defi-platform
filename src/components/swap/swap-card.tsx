"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownUp,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
  Wallet as WalletIcon,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSwapStore } from "@/store/swap-store";
import { useUiStore } from "@/store/ui-store";
import { findToken } from "@/lib/tokens";
import { TokenSelect } from "./token-select";
import { useJupiterQuote } from "@/hooks/use-jupiter-quote";
import {
  buildSwapTransaction,
  calcMinimumOutput,
  calcOutputAmount,
} from "@/lib/jupiter";
import { useDebounced } from "@/hooks/use-debounced";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { SOL_MINT } from "@/lib/constants";
import { cn, formatNumber, generateId } from "@/lib/utils";
import { SwapSettingsPanel } from "./swap-settings";
import { RoutePreview } from "./route-preview";

// Leave a small SOL reserve for tx fees / rent when the user clicks Max on SOL.
const SOL_FEE_RESERVE = 0.01;

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

export function SwapCard({ compact = false }: { compact?: boolean }) {
  const inputMint = useSwapStore((s) => s.inputMint);
  const outputMint = useSwapStore((s) => s.outputMint);
  const inputAmount = useSwapStore((s) => s.inputAmount);
  const slippageBps = useSwapStore((s) => s.slippageBps);
  const setInputMint = useSwapStore((s) => s.setInputMint);
  const setOutputMint = useSwapStore((s) => s.setOutputMint);
  const setInputAmount = useSwapStore((s) => s.setInputAmount);
  const swapDirection = useSwapStore((s) => s.swapDirection);
  const addHistory = useSwapStore((s) => s.addHistory);
  const updateHistory = useSwapStore((s) => s.updateHistory);
  const pushNotification = useUiStore((s) => s.pushNotification);

  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const inputToken = findToken(inputMint);
  const outputToken = findToken(outputMint);

  const inputBalance = useTokenBalance(connected ? inputMint : null);
  const usableBalance =
    inputMint === SOL_MINT
      ? Math.max(0, inputBalance.amount - SOL_FEE_RESERVE)
      : inputBalance.amount;

  const debouncedAmount = useDebounced(inputAmount, 400);
  const numAmount = parseFloat(debouncedAmount || "0");

  const { quote, loading, error, age } = useJupiterQuote({
    inputMint,
    outputMint,
    amount: numAmount,
    inputDecimals: inputToken?.decimals ?? 9,
    slippageBps,
    enabled: numAmount > 0 && inputMint !== outputMint,
  });

  const outAmount = useMemo(() => {
    if (!quote || !outputToken) return 0;
    return calcOutputAmount(quote, outputToken.decimals);
  }, [quote, outputToken]);

  const minOut = useMemo(() => {
    if (!quote || !outputToken) return 0;
    return calcMinimumOutput(quote, outputToken.decimals);
  }, [quote, outputToken]);

  const priceImpact = useMemo(() => {
    if (!quote) return 0;
    return Number(quote.priceImpactPct ?? 0) * 100;
  }, [quote]);

  const rate = numAmount > 0 ? outAmount / numAmount : 0;

  const insufficient =
    connected && inputBalance.hasLoaded && numAmount > inputBalance.amount;
  const wouldExceedReserve =
    connected &&
    inputBalance.hasLoaded &&
    !insufficient &&
    inputMint === SOL_MINT &&
    numAmount > usableBalance;

  const [isExecuting, setIsExecuting] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!age) return;
    const id = setInterval(
      () => setSecondsAgo(Math.max(0, Math.floor((Date.now() - age) / 1000))),
      500
    );
    return () => clearInterval(id);
  }, [age]);

  const handleSwap = async () => {
    if (!connected || !publicKey) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!signTransaction) {
      toast.error("Wallet does not support signing transactions");
      return;
    }
    if (!quote) {
      toast.error("No quote available");
      return;
    }
    if (inputBalance.hasLoaded && numAmount > inputBalance.amount) {
      toast.error(
        `Insufficient ${inputToken?.symbol ?? "balance"} — you have ${formatNumber(
          inputBalance.amount,
          6,
        )}.`,
      );
      return;
    }
    setIsExecuting(true);
    const id = generateId("hist");
    addHistory({
      id,
      timestamp: Date.now(),
      inputMint,
      outputMint,
      inputSymbol: inputToken?.symbol ?? "?",
      outputSymbol: outputToken?.symbol ?? "?",
      inAmount: numAmount,
      outAmount,
      status: "pending",
      priceImpact,
      routes: quote.routePlan?.length ?? 0,
    });

    toast.loading("Building swap transaction…", { id });

    try {
      const swapTx = await buildSwapTransaction({
        quoteResponse: quote,
        userPublicKey: publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        prioritizationFeeLamports: "auto",
        dynamicComputeUnitLimit: true,
      });

      const txBytes = Uint8Array.from(
        atob(swapTx.swapTransaction),
        (c) => c.charCodeAt(0),
      );
      const tx = VersionedTransaction.deserialize(txBytes);

      toast.loading("Awaiting wallet signature…", { id });
      const signed = await signTransaction(tx);

      toast.loading("Broadcasting transaction…", { id });
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      updateHistory(id, { status: "pending", txSignature: signature });
      toast.loading("Confirming on-chain…", {
        id,
        description: signature.slice(0, 12) + "…",
      });

      const latest = await connection.getLatestBlockhash("confirmed");
      const conf = await connection.confirmTransaction(
        {
          signature,
          blockhash: latest.blockhash,
          lastValidBlockHeight: swapTx.lastValidBlockHeight,
        },
        "confirmed",
      );

      if (conf.value.err) {
        updateHistory(id, { status: "failed", txSignature: signature });
        toast.error("Swap failed on-chain", {
          id,
          description: JSON.stringify(conf.value.err),
        });
      } else {
        updateHistory(id, { status: "success", txSignature: signature });
        toast.success(
          `Swap complete · ${numAmount.toFixed(4)} ${inputToken?.symbol} → ${outAmount.toFixed(4)} ${outputToken?.symbol}`,
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
        pushNotification({
          title: "Swap complete",
          description: `${numAmount.toFixed(4)} ${inputToken?.symbol} → ${outAmount.toFixed(4)} ${outputToken?.symbol} · ${signature.slice(0, 8)}…`,
          type: "success",
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      updateHistory(id, { status: "failed" });
      toast.error("Swap aborted", { id, description: msg });
      pushNotification({
        title: "Swap failed",
        description: msg.slice(0, 140),
        type: "error",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <CardContent className="p-5 sm:p-6 space-y-3 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default">
              <Zap className="size-3" />
              Jupiter v6
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              Best route
            </Badge>
          </div>
          <SwapSettingsPanel />
        </div>

        <SideBox
          label="You pay"
          tokenMint={inputMint}
          onTokenChange={setInputMint}
          excludeMint={outputMint}
          amount={inputAmount}
          onAmountChange={setInputAmount}
          balance={connected ? inputBalance.amount : null}
          balanceLoading={inputBalance.loading && !inputBalance.hasLoaded}
          onMax={
            connected && usableBalance > 0
              ? () => setInputAmount(usableBalance.toString())
              : undefined
          }
        />

        <div className="relative -my-1">
          <button
            type="button"
            onClick={swapDirection}
            className="absolute left-1/2 -translate-x-1/2 size-9 rounded-xl glass-strong border border-white/10 hover:border-primary/40 grid place-items-center transition-all hover:rotate-180"
            aria-label="Swap direction"
          >
            <ArrowDownUp className="size-4" />
          </button>
        </div>

        <SideBox
          label="You receive"
          tokenMint={outputMint}
          onTokenChange={setOutputMint}
          excludeMint={inputMint}
          amount={outAmount > 0 ? outAmount.toFixed(6) : ""}
          readOnly
          loading={loading}
        />

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] divide-y divide-white/[0.04]">
          <Row label="Rate" value={rate ? `1 ${inputToken?.symbol} ≈ ${formatNumber(rate, 4)} ${outputToken?.symbol}` : "—"} />
          <Row
            label="Minimum received"
            value={minOut ? `${formatNumber(minOut, 6)} ${outputToken?.symbol}` : "—"}
          />
          <Row
            label="Price impact"
            value={
              quote ? (
                <span
                  className={cn(
                    "font-mono",
                    priceImpact > 5
                      ? "text-rose-400"
                      : priceImpact > 1
                        ? "text-amber-400"
                        : "text-emerald-400"
                  )}
                >
                  {priceImpact.toFixed(3)}%
                </span>
              ) : (
                "—"
              )
            }
          />
          <Row
            label="Slippage tolerance"
            value={`${(slippageBps / 100).toFixed(2)}%`}
          />
          <Row
            label="Routes"
            value={
              quote?.routePlan?.length
                ? `${quote.routePlan.length} hop${quote.routePlan.length > 1 ? "s" : ""}`
                : "—"
            }
          />
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300 flex items-start gap-2">
            <Info className="size-3.5 mt-0.5 shrink-0" />
            <span>Quote error: {error}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {loading ? (
            <>
              <Loader2 className="size-3 animate-spin" /> Fetching best route…
            </>
          ) : age ? (
            <>
              <RefreshCw className="size-3" />
              Updated {secondsAgo}s ago · auto refresh
            </>
          ) : (
            <>
              <Sparkles className="size-3" />
              Enter an amount to start
            </>
          )}
        </div>

        {!compact && quote && quote.routePlan?.length > 0 && (
          <RoutePreview quote={quote} />
        )}

        {connected ? (
          <Button
            size="xl"
            variant="gradient"
            className="w-full"
            disabled={
              !quote ||
              isExecuting ||
              numAmount <= 0 ||
              insufficient ||
              wouldExceedReserve
            }
            onClick={handleSwap}
          >
            {isExecuting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Confirming swap…
              </>
            ) : insufficient ? (
              `Insufficient ${inputToken?.symbol ?? "balance"}`
            ) : wouldExceedReserve ? (
              `Leave ${SOL_FEE_RESERVE} SOL for fees`
            ) : !quote ? (
              "Enter an amount"
            ) : (
              <>
                <Zap className="size-4" />
                Swap
              </>
            )}
          </Button>
        ) : (
          <div className="w-full">
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
                boxShadow: "0 8px 30px -12px hsl(var(--primary) / 0.6)",
              }}
            >
              <WalletIcon className="size-4" />
              Connect wallet
            </WalletMultiButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SideBox({
  label,
  tokenMint,
  onTokenChange,
  excludeMint,
  amount,
  onAmountChange,
  readOnly,
  loading,
  balance,
  balanceLoading,
  onMax,
}: {
  label: string;
  tokenMint: string;
  onTokenChange: (m: string) => void;
  excludeMint?: string;
  amount: string | number;
  onAmountChange?: (v: string) => void;
  readOnly?: boolean;
  loading?: boolean;
  balance?: number | null;
  balanceLoading?: boolean;
  onMax?: () => void;
}) {
  const balanceLabel =
    balance == null
      ? "—"
      : balanceLoading
        ? "loading…"
        : formatNumber(balance, balance < 1 ? 6 : 4);
  return (
    <motion.div
      whileFocus={{ scale: 1.01 }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:border-white/10 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15"
    >
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
        <span>{label}</span>
        <span className="flex items-center gap-2">
          <span>Balance: {balanceLabel}</span>
          {onMax ? (
            <button
              type="button"
              onClick={onMax}
              className="text-[10px] uppercase tracking-wider rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 hover:border-primary/40 hover:text-foreground transition-colors"
            >
              Max
            </button>
          ) : null}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={typeof amount === "number" ? (amount === 0 ? "" : String(amount)) : amount}
          readOnly={readOnly}
          onChange={(e) => onAmountChange?.(e.target.value)}
          className="bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight w-full focus:outline-none disabled:opacity-50"
        />
        <TokenSelect value={tokenMint} onChange={onTokenChange} exclude={excludeMint} />
      </div>
      {loading && readOnly && (
        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          <Loader2 className="size-3 animate-spin" /> calculating…
        </div>
      )}
    </motion.div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground/90">{value}</span>
    </div>
  );
}

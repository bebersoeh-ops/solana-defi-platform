"use client";

import { useEffect, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  fetchSignaturesForAddress,
  type RpcSignature,
} from "@/lib/market-data";
import { formatRelativeTime, shortenAddress } from "@/lib/utils";
import { Activity, ArrowUpRight } from "lucide-react";

export default function HistoryPage() {
  const { publicKey } = useWallet();
  const [sigs, setSigs] = useState<RpcSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setSigs([]);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchSignaturesForAddress(publicKey.toString(), 50, controller.signal)
      .then((s) => {
        if (!cancelled) setSigs(s);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [publicKey]);

  return (
    <SectionShell
      title="Transaction History"
      description="Last 50 on-chain signatures for the connected wallet via Solana RPC."
      badge={
        publicKey
          ? loading
            ? "Loading"
            : `${sigs.length} sigs`
          : "Connect wallet"
      }
      baseHref="/portfolio"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4 text-primary" /> Events
          </CardTitle>
          <CardDescription>
            {publicKey
              ? `Wallet ${shortenAddress(publicKey.toString(), 6)} · live via Solana RPC.`
              : "Connect a wallet to load real on-chain signatures."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {!publicKey ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No wallet connected.
            </div>
          ) : error ? (
            <div className="px-5 py-10 text-center text-sm text-rose-400">
              Failed to load signatures: {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04]">
                  <tr>
                    <th className="text-left px-5 py-2 font-medium">Status</th>
                    <th className="text-left px-2 py-2 font-medium">Signature</th>
                    <th className="text-right px-2 py-2 font-medium">Slot</th>
                    <th className="text-right px-5 py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && sigs.length === 0
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="border-b border-white/[0.03]">
                          <td colSpan={4} className="px-5 py-3">
                            <Skeleton className="h-6 w-full" />
                          </td>
                        </tr>
                      ))
                    : sigs.length === 0
                      ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-10 text-center text-sm text-muted-foreground"
                          >
                            No recent signatures.
                          </td>
                        </tr>
                      )
                      : sigs.map((s) => (
                          <tr key={s.signature} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                            <td className="px-5 py-2.5">
                              <Badge
                                variant={s.err ? "destructive" : "success"}
                                className="text-[9px] uppercase"
                              >
                                {s.err ? "failed" : "ok"}
                              </Badge>
                            </td>
                            <td className="px-2 py-2.5 font-mono text-xs">
                              <a
                                href={`https://solscan.io/tx/${s.signature}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 hover:text-foreground"
                              >
                                {shortenAddress(s.signature, 8)}
                                <ArrowUpRight className="size-3" />
                              </a>
                              {s.memo ? (
                                <div className="text-[10px] text-muted-foreground truncate max-w-[280px]">
                                  {s.memo}
                                </div>
                              ) : null}
                            </td>
                            <td className="px-2 py-2.5 text-right font-mono text-xs">
                              {s.slot.toLocaleString()}
                            </td>
                            <td className="px-5 py-2.5 text-right text-muted-foreground text-xs">
                              {s.blockTime
                                ? formatRelativeTime(s.blockTime * 1000)
                                : "—"}
                            </td>
                          </tr>
                        ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </SectionShell>
  );
}

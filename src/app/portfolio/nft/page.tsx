"use client";

import { useEffect, useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { shortenAddress } from "@/lib/utils";

interface NftAccount {
  mint: string;
  owner: string;
}

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);

export default function NftOverviewPage() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [nfts, setNfts] = useState<NftAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey || !connected) {
      setNfts([]);
      return;
    }
    let cancelled = false;
    const owner = publicKey;
    setLoading(true);
    setError(null);

    type ParsedTokenInfo = {
      mint: string;
      tokenAmount: { uiAmount: number | null; decimals: number };
    };
    type ParsedAccountData = {
      parsed: { info: ParsedTokenInfo };
    };

    connection
      .getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID })
      .then((res) => {
        const items: NftAccount[] = [];
        for (const acc of res.value) {
          const data = acc.account.data as unknown as ParsedAccountData;
          const info = data?.parsed?.info;
          if (!info) continue;
          if (info.tokenAmount.decimals === 0 && (info.tokenAmount.uiAmount ?? 0) === 1) {
            items.push({ mint: info.mint, owner: owner.toString() });
          }
        }
        if (!cancelled) setNfts(items);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [publicKey, connected, connection]);

  return (
    <SectionShell
      title="NFT Overview"
      description="On-chain NFT-like SPL accounts for the connected wallet (decimals = 0, amount = 1)."
      badge={
        !connected ? "Connect wallet" : loading ? "Loading" : `${nfts.length} NFTs`
      }
      baseHref="/portfolio"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" /> Summary
            </CardTitle>
            <CardDescription>
              {connected
                ? "Live · Solana RPC scan of your token accounts."
                : "Connect a wallet to view your NFTs."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Mini label="Total NFTs" value={connected ? String(nfts.length) : "—"} />
            <Mini
              label="Wallet"
              value={publicKey ? shortenAddress(publicKey.toString(), 4) : "—"}
            />
            <Mini label="Source" value="getParsedTokenAccountsByOwner" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>NFT mints</CardTitle>
            <CardDescription>
              {error
                ? `Error: ${error}`
                : connected
                  ? "Tap a mint to open it on Solscan."
                  : "Wallet not connected."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && nfts.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : !connected ? (
              <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-10 text-center text-sm text-muted-foreground">
                Connect a wallet to load your NFTs.
              </div>
            ) : nfts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] py-10 text-center text-sm text-muted-foreground">
                No NFT-like SPL accounts found.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {nfts.slice(0, 60).map((n) => (
                  <a
                    key={n.mint}
                    href={`https://solscan.io/token/${n.mint}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/[0.06] overflow-hidden hover:border-white/20 transition-colors"
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-fuchsia-500/30 to-sky-500/20">
                      <div className="absolute inset-0 grid-pattern opacity-20" />
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-mono truncate">
                        {shortenAddress(n.mint, 6)}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Solscan ↗
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

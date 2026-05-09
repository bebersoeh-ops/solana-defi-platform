"use client";

import { useState } from "react";
import { SectionShell } from "@/components/shell/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressInput } from "@/components/tools/address-input";
import { Search, Globe2 } from "lucide-react";
import {
  fetchAccountSnapshot,
  fetchMintInfo,
  type AccountSnapshot,
  type MintInfo,
} from "@/lib/market-data";
import { shortenAddress } from "@/lib/utils";

const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";

interface LookupResult {
  address: string;
  account: AccountSnapshot | null;
  mint: MintInfo | null;
  kind: "wallet" | "mint" | "program" | "unknown" | "missing";
}

function classify(account: AccountSnapshot | null, mint: MintInfo | null): LookupResult["kind"] {
  if (!account) return "unknown";
  if (!account.exists) return "missing";
  if (mint) return "mint";
  if (account.executable) return "program";
  if (account.owner === SYSTEM_PROGRAM_ID) return "wallet";
  return "unknown";
}

export default function LookupPage() {
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(address: string) {
    setLoading(true);
    setError(null);
    try {
      const account = await fetchAccountSnapshot(address);
      let mint: MintInfo | null = null;
      if (
        account?.exists &&
        (account.owner === TOKEN_PROGRAM_ID ||
          account.owner === TOKEN_2022_PROGRAM_ID)
      ) {
        mint = await fetchMintInfo(address);
      }
      setResult({
        address,
        account,
        mint,
        kind: classify(account, mint),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionShell
      title="Address Lookup"
      description="Resolve a wallet, token mint, or program account to a quick summary."
      badge="Live · RPC"
      baseHref="/tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="size-4 text-primary" /> Lookup
            </CardTitle>
            <CardDescription>
              Wallet, mint, or program — resolved live via Solana mainnet RPC.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressInput onSubmit={lookup} />
            {loading ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : error ? (
              <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
                {error}
              </div>
            ) : result ? (
              <ResultCard r={result} />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="size-4 text-primary" /> Open externally
            </CardTitle>
            <CardDescription>
              {result
                ? `Inspect ${shortenAddress(result.address, 6)} on popular explorers.`
                : "After lookup, open the address on popular explorers."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(
              result
                ? [
                    {
                      name: "Solscan",
                      url: `https://solscan.io/account/${result.address}`,
                    },
                    {
                      name: "Solana FM",
                      url: `https://solana.fm/address/${result.address}`,
                    },
                    {
                      name: "SolanaBeach",
                      url: `https://solanabeach.io/address/${result.address}`,
                    },
                    {
                      name: "XRAY (Helius)",
                      url: `https://xray.helius.xyz/account/${result.address}`,
                    },
                    {
                      name: "Birdeye",
                      url: `https://birdeye.so/token/${result.address}?chain=solana`,
                    },
                  ]
                : []
            ).map((l) => (
              <a
                key={l.name}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs hover:border-white/20"
              >
                <span>{l.name}</span>
                <span className="text-muted-foreground">Open ↗</span>
              </a>
            ))}
            {!result ? (
              <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] px-3 py-2 text-xs text-muted-foreground">
                No address looked up yet.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function ResultCard({ r }: { r: LookupResult }) {
  if (r.kind === "missing") {
    return (
      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
        Account does not exist on mainnet.
      </div>
    );
  }
  if (!r.account) {
    return (
      <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
        RPC returned no result.
      </div>
    );
  }
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
      <Field label="Type" value={r.kind.toUpperCase()} />
      <Field label="Owner program" value={shortenAddress(r.account.owner, 6)} />
      <Field
        label="Lamports"
        value={`${(r.account.lamports / 1e9).toFixed(6)} SOL`}
      />
      <Field
        label="Executable"
        value={r.account.executable ? "Yes" : "No"}
      />
      <Field label="Data length" value={`${r.account.dataLen} bytes`} />
      <Field label="Rent epoch" value={String(r.account.rentEpoch)} />
      {r.mint ? (
        <>
          <Field label="Mint decimals" value={String(r.mint.decimals)} />
          <Field
            label="Supply"
            value={`${(Number(r.mint.supply) / 10 ** r.mint.decimals).toLocaleString()}`}
          />
          <Field
            label="Mint authority"
            value={r.mint.mintAuthority ? shortenAddress(r.mint.mintAuthority, 6) : "Renounced"}
          />
          <Field
            label="Freeze authority"
            value={r.mint.freezeAuthority ? shortenAddress(r.mint.freezeAuthority, 6) : "Renounced"}
          />
        </>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-0.5 text-xs font-mono break-all">{value}</div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, Star, ShieldAlert, Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TokenIcon } from "@/components/shared/token-icon";
import { STATIC_TOKENS, findToken } from "@/lib/tokens";
import { cn, formatNumber } from "@/lib/utils";
import { useSwapStore } from "@/store/swap-store";
import { useTokenStore } from "@/store/token-store";
import {
  looksLikeAddressInput,
  resolveTokenWithDiagnostics,
  searchJupiterTokens,
  type ResolveFailure,
  type ResolvedTokenMeta,
} from "@/lib/token-resolver";
import type { Token } from "@/lib/types";

export function TokenSelect({
  value,
  onChange,
  exclude,
}: {
  value: string;
  onChange: (mint: string) => void;
  exclude?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const favorites = useSwapStore((s) => s.favorites);
  const recent = useSwapStore((s) => s.recentTokens);
  const toggleFavorite = useSwapStore((s) => s.toggleFavorite);
  const dynamicTokens = useTokenStore((s) => s.tokens);
  const addDynamicToken = useTokenStore((s) => s.addToken);

  const token = findToken(value) ?? dynamicTokens[value];

  const trimmed = query.trim();
  const isMint = useMemo(() => looksLikeAddressInput(trimmed), [trimmed]);

  const [resolved, setResolved] = useState<ResolvedTokenMeta | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveFailure, setResolveFailure] = useState<ResolveFailure | null>(null);

  const [searchHits, setSearchHits] = useState<ResolvedTokenMeta[]>([]);
  const [searching, setSearching] = useState(false);

  // Resolve a single mint when the user pastes a Solana address.
  useEffect(() => {
    setResolved(null);
    setResolveFailure(null);
    if (!isMint) return;
    if (findToken(trimmed) || dynamicTokens[trimmed]) return;
    const ctrl = new AbortController();
    setResolving(true);
    (async () => {
      try {
        const out = await resolveTokenWithDiagnostics(trimmed, ctrl.signal);
        if (ctrl.signal.aborted) return;
        if (out.ok) {
          setResolved(out.token);
        } else {
          setResolveFailure(out.failure);
        }
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setResolveFailure({
          reason: "network-error",
          message: e instanceof Error ? e.message : "Lookup failed",
        });
      } finally {
        if (!ctrl.signal.aborted) setResolving(false);
      }
    })();
    return () => ctrl.abort();
  }, [trimmed, isMint, dynamicTokens]);

  // Free-form Jupiter token search when query is at least 2 chars and not a mint.
  useEffect(() => {
    setSearchHits([]);
    if (!trimmed || trimmed.length < 2 || isMint) return;
    const ctrl = new AbortController();
    setSearching(true);
    const t = window.setTimeout(async () => {
      try {
        const hits = await searchJupiterTokens(trimmed, 10, ctrl.signal);
        if (ctrl.signal.aborted) return;
        const filtered = hits.filter((h) => {
          if (exclude && h.address === exclude) return false;
          if (findToken(h.address)) return false;
          return true;
        });
        setSearchHits(filtered);
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [trimmed, isMint, exclude]);

  const filteredStatic = useMemo(() => {
    const q = trimmed.toLowerCase();
    return STATIC_TOKENS.filter((t) => {
      if (exclude && t.address === exclude) return false;
      if (!q) return true;
      return (
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q)
      );
    });
  }, [trimmed, exclude]);

  const dynamicMatches = useMemo(() => {
    if (!trimmed) {
      return Object.values(dynamicTokens).filter(
        (t) => !exclude || t.address !== exclude,
      );
    }
    const q = trimmed.toLowerCase();
    return Object.values(dynamicTokens).filter((t) => {
      if (exclude && t.address === exclude) return false;
      return (
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q)
      );
    });
  }, [trimmed, dynamicTokens, exclude]);

  const recentTokens = useMemo(
    () =>
      recent
        .map((m) => findToken(m) ?? dynamicTokens[m])
        .filter((t): t is Token => Boolean(t))
        .filter((t) => t.address !== exclude)
        .slice(0, 4),
    [recent, exclude, dynamicTokens],
  );

  const handlePick = (mint: string, meta?: Token) => {
    if (meta) addDynamicToken(meta);
    onChange(mint);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
      >
        <TokenIcon src={token?.logoURI} symbol={token?.symbol} alt={token?.symbol} size={24} />
        <span className="font-medium text-sm">{token?.symbol ?? "Select"}</span>
        <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <div className="px-5 pt-5 pb-4">
            <div className="text-base font-semibold">Select a token</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Search by symbol, name, or paste any Solana mint address.
            </p>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search or paste a contract address"
                className="pl-9 font-mono text-xs"
              />
            </div>
            {recentTokens.length > 0 && !query && (
              <div className="mt-3 flex flex-wrap gap-1">
                {recentTokens.map((t) => (
                  <button
                    key={t.address}
                    type="button"
                    onClick={() => handlePick(t.address)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-xs hover:bg-white/[0.05]"
                  >
                    <TokenIcon src={t.logoURI} symbol={t.symbol} size={14} />
                    {t.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06] max-h-96 overflow-y-auto">
            {isMint && (
              <ResolveBanner
                mint={trimmed}
                resolved={resolved}
                resolving={resolving}
                failure={resolveFailure}
                onPick={handlePick}
              />
            )}

            {searchHits.length > 0 && (
              <SectionHeader label={`Jupiter results (${searchHits.length})`} />
            )}
            {searchHits.map((t) => (
              <TokenRow
                key={`hit-${t.address}`}
                token={t}
                value={value}
                fav={favorites.includes(t.address)}
                onPick={() => handlePick(t.address, t)}
                onToggleFav={() => toggleFavorite(t.address)}
                external
              />
            ))}

            {dynamicMatches.length > 0 && (
              <SectionHeader label="Recently pasted" />
            )}
            {dynamicMatches.map((t) => (
              <TokenRow
                key={`dyn-${t.address}`}
                token={t}
                value={value}
                fav={favorites.includes(t.address)}
                onPick={() => handlePick(t.address)}
                onToggleFav={() => toggleFavorite(t.address)}
                external
              />
            ))}

            {filteredStatic.length > 0 && (
              <SectionHeader label="Verified tokens" />
            )}
            <ul>
              {filteredStatic.map((t, i) => (
                <motion.li
                  key={t.address}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01, duration: 0.15 }}
                >
                  <TokenRow
                    token={t}
                    value={value}
                    fav={favorites.includes(t.address)}
                    onPick={() => handlePick(t.address)}
                    onToggleFav={() => toggleFavorite(t.address)}
                  />
                </motion.li>
              ))}
            </ul>

            {!isMint &&
              filteredStatic.length === 0 &&
              dynamicMatches.length === 0 &&
              searchHits.length === 0 &&
              !searching && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {trimmed ? `No tokens match "${trimmed}"` : "No tokens"}
                </div>
              )}
            {searching && (
              <div className="py-3 px-5 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-3 animate-spin" /> Searching Jupiter…
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-5 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 bg-white/[0.015] border-y border-white/[0.04]">
      {label}
    </div>
  );
}

function TokenRow({
  token,
  value,
  fav,
  onPick,
  onToggleFav,
  external,
}: {
  token: Token;
  value: string;
  fav: boolean;
  onPick: () => void;
  onToggleFav: () => void;
  external?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "w-full flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.04] transition-colors",
        token.address === value && "bg-white/[0.04]",
      )}
    >
      <TokenIcon src={token.logoURI} symbol={token.symbol} size={28} />
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{token.symbol}</span>
          {token.tags?.slice(0, 1).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[9px] py-0">
              {tag}
            </Badge>
          ))}
          {external && (
            <Badge variant="outline" className="text-[9px] py-0">
              <ShieldAlert className="size-2.5" />
              unverified
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {token.name}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav();
        }}
        className={cn(
          "p-1 rounded-md transition-colors",
          fav ? "text-amber-400" : "text-muted-foreground/40 hover:text-foreground",
        )}
        aria-label="Favorite"
      >
        <Star className="size-3.5" fill={fav ? "currentColor" : "none"} />
      </button>
    </button>
  );
}

function ResolveBanner({
  mint,
  resolved,
  resolving,
  failure,
  onPick,
}: {
  mint: string;
  resolved: ResolvedTokenMeta | null;
  resolving: boolean;
  failure: ResolveFailure | null;
  onPick: (mint: string, meta?: Token) => void;
}) {
  if (resolving) {
    return (
      <div className="m-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 flex items-center gap-3 text-sm">
        <Loader2 className="size-4 animate-spin text-primary" />
        <div className="flex-1 min-w-0">
          <div className="font-medium">Resolving address…</div>
          <div className="text-[11px] font-mono text-muted-foreground truncate">
            {mint}
          </div>
        </div>
      </div>
    );
  }

  if (failure || !resolved) {
    const title =
      failure?.reason === "not-a-token"
        ? "Not a token mint"
        : failure?.reason === "invalid-format"
          ? "Invalid Solana address"
          : "Could not resolve this address";
    const message =
      failure?.message ??
      "Jupiter, DexScreener, and the on-chain Metaplex registry don't know this mint.";
    return (
      <div className="m-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-3 text-sm">
        <div className="flex items-start gap-2">
          <ShieldAlert className="size-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-amber-200">{title}</div>
            <div className="text-[11px] text-amber-300/80 mt-0.5">{message}</div>
            {failure?.owner && (
              <div className="text-[10px] font-mono text-amber-300/60 mt-1 truncate">
                Owner: {failure.owner}
              </div>
            )}
            <div className="text-[10px] font-mono text-muted-foreground mt-1 truncate">
              {mint}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sourceLabel: Record<ResolvedTokenMeta["source"], string> = {
    static: "verified list",
    jupiter: "Jupiter graph",
    dexscreener: "DexScreener",
    onchain: "on-chain metadata",
  };

  return (
    <div className="m-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-3">
      <div className="flex items-center gap-3">
        <TokenIcon src={resolved.logoURI} symbol={resolved.symbol} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-base">{resolved.symbol}</span>
            {!resolved.verified && (
              <Badge variant="outline" className="text-[9px] py-0">
                <ShieldAlert className="size-2.5" />
                unverified
              </Badge>
            )}
            <Badge variant="secondary" className="text-[9px] py-0">
              {sourceLabel[resolved.source]}
            </Badge>
            {resolved.organicScore !== undefined && (
              <Badge variant="secondary" className="text-[9px] py-0">
                organic {(resolved.organicScore * 100).toFixed(0)}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {resolved.name}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground/80 truncate mt-0.5">
            {resolved.address}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPick(resolved.address, resolved)}
          className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:opacity-90"
        >
          <Plus className="size-3.5" />
          Use
        </button>
      </div>
      {(resolved.usdPrice !== undefined ||
        resolved.liquidityUsd !== undefined ||
        resolved.holderCount !== undefined) && (
        <div className="mt-2.5 grid grid-cols-3 gap-2 text-[10px]">
          {resolved.usdPrice !== undefined && (
            <Stat label="Price" value={`$${formatNumber(resolved.usdPrice, resolved.usdPrice < 1 ? 6 : 2)}`} />
          )}
          {resolved.liquidityUsd !== undefined && (
            <Stat label="Liquidity" value={`$${formatNumber(resolved.liquidityUsd, 2)}`} />
          )}
          {resolved.holderCount !== undefined && (
            <Stat label="Holders" value={formatNumber(resolved.holderCount, 0)} />
          )}
        </div>
      )}
      {resolved.source === "onchain" && resolved.liquidityUsd === undefined && (
        <div className="mt-2 text-[10px] text-amber-300/80">
          Resolved via on-chain metadata only — no DEX liquidity detected, so Jupiter swap may fail.
        </div>
      )}
      <div className="mt-2 text-[10px] text-amber-300/80">
        Always double-check the contract — anyone can mint a token with any name on Solana.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/[0.04] px-2 py-1.5">
      <div className="text-muted-foreground/70 uppercase tracking-wider text-[9px]">
        {label}
      </div>
      <div className="font-mono text-foreground/90">{value}</div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TokenIcon } from "@/components/shared/token-icon";
import { STATIC_TOKENS, findToken } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import { useSwapStore } from "@/store/swap-store";
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

  const token = findToken(value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STATIC_TOKENS.filter((t) => {
      if (exclude && t.address === exclude) return false;
      if (!q) return true;
      return (
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q)
      );
    });
  }, [query, exclude]);

  const recentTokens = useMemo(
    () =>
      recent
        .map((m) => findToken(m))
        .filter((t): t is Token => Boolean(t))
        .filter((t) => t.address !== exclude)
        .slice(0, 4),
    [recent, exclude]
  );

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
              Search across {STATIC_TOKENS.length}+ supported tokens
            </p>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by symbol, name, or address"
                className="pl-9"
              />
            </div>
            {recentTokens.length > 0 && !query && (
              <div className="mt-3 flex flex-wrap gap-1">
                {recentTokens.map((t) => (
                  <button
                    key={t.address}
                    type="button"
                    onClick={() => {
                      onChange(t.address);
                      setOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-xs hover:bg-white/[0.05]"
                  >
                    <TokenIcon src={t.logoURI} symbol={t.symbol} size={14} />
                    {t.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-white/[0.06] max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No tokens match "{query}"
              </div>
            ) : (
              <ul>
                {filtered.map((t, i) => {
                  const fav = favorites.includes(t.address);
                  return (
                    <motion.li
                      key={t.address}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01, duration: 0.15 }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onChange(t.address);
                          setOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.04] transition-colors",
                          t.address === value && "bg-white/[0.04]"
                        )}
                      >
                        <TokenIcon src={t.logoURI} symbol={t.symbol} size={28} />
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{t.symbol}</span>
                            {t.tags?.slice(0, 1).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[9px] py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {t.name}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(t.address);
                          }}
                          className={cn(
                            "p-1 rounded-md transition-colors",
                            fav
                              ? "text-amber-400"
                              : "text-muted-foreground/40 hover:text-foreground"
                          )}
                          aria-label="Favorite"
                        >
                          <Star
                            className="size-3.5"
                            fill={fav ? "currentColor" : "none"}
                          />
                        </button>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

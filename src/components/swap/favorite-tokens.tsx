"use client";

import { Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSwapStore } from "@/store/swap-store";
import { findToken } from "@/lib/tokens";
import { TokenIcon } from "@/components/shared/token-icon";
import { useMounted } from "@/hooks/use-mounted";
import { EmptyState } from "@/components/ui/empty-state";

export function FavoriteTokens() {
  const mounted = useMounted();
  const favorites = useSwapStore((s) => s.favorites);
  const setOutputMint = useSwapStore((s) => s.setOutputMint);

  const tokens = favorites.map((m) => findToken(m)).filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="size-4 text-amber-400" />
          Favorite tokens
        </CardTitle>
        <CardDescription>
          Quickly select a favorite as the output token.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {!mounted ? null : tokens.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No favorites yet"
            description="Star a token in the picker to pin it here."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {tokens.map((t) => (
              <button
                key={t!.address}
                type="button"
                onClick={() => setOutputMint(t!.address)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs hover:bg-white/[0.05]"
              >
                <TokenIcon src={t!.logoURI} symbol={t!.symbol} size={16} />
                {t!.symbol}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

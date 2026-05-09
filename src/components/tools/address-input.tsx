"use client";

import { useState, type ReactNode } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils";

export function AddressInput({
  placeholder = "Enter Solana address (base58)…",
  onSubmit,
  initial,
  hint,
}: {
  placeholder?: string;
  onSubmit?: (addr: string) => void | Promise<void>;
  initial?: string;
  hint?: ReactNode;
}) {
  const [v, setV] = useState(initial ?? "");
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!v) return;
        setLoading(true);
        try {
          await onSubmit?.(v);
        } finally {
          setLoading(false);
        }
      }}
      className="space-y-2"
    >
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder={placeholder}
            className="pl-9 font-mono text-xs"
          />
        </div>
        <Button type="submit" variant="gradient" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Lookup"}
        </Button>
      </div>
      {v ? (
        <div className="text-[10px] text-muted-foreground font-mono">
          {shortenAddress(v, 8)}
        </div>
      ) : null}
      {hint}
    </form>
  );
}

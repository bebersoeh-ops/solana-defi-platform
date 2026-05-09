"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function TokenIcon({
  src,
  alt,
  symbol,
  size = 24,
  className,
}: {
  src?: string;
  alt?: string;
  symbol?: string;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 font-mono uppercase",
          className
        )}
        style={{ width: size, height: size, fontSize: Math.max(8, size / 3) }}
        aria-label={alt}
      >
        {(symbol ?? alt ?? "?").slice(0, 2)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? symbol ?? ""}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
      className={cn("rounded-full", className)}
      style={{ width: size, height: size }}
    />
  );
}

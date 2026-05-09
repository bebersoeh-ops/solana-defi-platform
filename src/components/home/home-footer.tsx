import Link from "next/link";
import { Code2, Globe, MessageCircle } from "lucide-react";

export function HomeFooter() {
  return (
    <footer className="rounded-2xl border border-white/[0.04] glass-card p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">Lumen — built on Jupiter</div>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Routes powered by Jupiter Aggregator. No proprietary smart contracts
            deployed. All swaps are routed through Jupiter's public API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="https://jup.ag"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs hover:bg-white/[0.04]"
          >
            <Globe className="size-3.5" /> jup.ag
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs hover:bg-white/[0.04]"
          >
            <Code2 className="size-3.5" /> Source
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs hover:bg-white/[0.04]"
          >
            <MessageCircle className="size-3.5" /> Updates
          </Link>
        </div>
      </div>
    </footer>
  );
}

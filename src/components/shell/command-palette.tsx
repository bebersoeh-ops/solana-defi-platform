"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command as CmdIcon, Search, Sparkles } from "lucide-react";
import { Command } from "cmdk";
import { useUiStore } from "@/store/ui-store";
import { flattenNav } from "@/lib/navigation";
import { STATIC_TOKENS } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const navItems = useMemo(() => flattenNav(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setOpen(false)}
      />
      <Command
        className="relative w-full max-w-xl rounded-xl border border-white/[0.08] bg-[#0a0c12]/95 shadow-2xl overflow-hidden"
        shouldFilter
      >
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search pages, tokens, actions…"
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 text-[10px] font-mono">
            ESC
          </kbd>
        </div>
        <Command.List className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
          <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
            No results for "{query}"
          </Command.Empty>
          <Command.Group
            heading="Navigation"
            className="text-[10px] uppercase tracking-widest text-muted-foreground/70 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
          >
            {navItems.slice(0, 24).map((item) => (
              <Command.Item
                key={`nav-${item.href}`}
                value={`${item.title} ${item.href}`}
                onSelect={() => go(item.href)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm cursor-pointer",
                  "data-[selected=true]:bg-white/[0.05] data-[selected=true]:text-primary"
                )}
              >
                {item.icon ? (
                  <item.icon className="size-4 text-muted-foreground" />
                ) : (
                  <CmdIcon className="size-4 text-muted-foreground" />
                )}
                <span className="flex-1">{item.title}</span>
                {item.description ? (
                  <span className="text-xs text-muted-foreground hidden sm:block truncate">
                    {item.description}
                  </span>
                ) : null}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group
            heading="Tokens"
            className="text-[10px] uppercase tracking-widest text-muted-foreground/70 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 mt-2"
          >
            {STATIC_TOKENS.slice(0, 12).map((t) => (
              <Command.Item
                key={`tok-${t.address}`}
                value={`${t.symbol} ${t.name} ${t.address}`}
                onSelect={() => go(`/trade/swap?out=${t.address}`)}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm cursor-pointer data-[selected=true]:bg-white/[0.05]"
              >
                {t.logoURI ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.logoURI}
                    alt={t.symbol}
                    className="size-5 rounded-full"
                    loading="lazy"
                  />
                ) : (
                  <span className="size-5 rounded-full bg-white/10" />
                )}
                <span className="font-medium">{t.symbol}</span>
                <span className="text-muted-foreground text-xs">{t.name}</span>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group
            heading="Actions"
            className="text-[10px] uppercase tracking-widest text-muted-foreground/70 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 mt-2"
          >
            <Command.Item
              onSelect={() => go("/trade/swap")}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm cursor-pointer data-[selected=true]:bg-white/[0.05]"
            >
              <Sparkles className="size-4 text-primary" />
              Start a quick swap
            </Command.Item>
            <Command.Item
              onSelect={() => go("/portfolio/overview")}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm cursor-pointer data-[selected=true]:bg-white/[0.05]"
            >
              <Sparkles className="size-4 text-primary" />
              Open my portfolio
            </Command.Item>
            <Command.Item
              onSelect={() => go("/analytics/trending")}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm cursor-pointer data-[selected=true]:bg-white/[0.05]"
            >
              <Sparkles className="size-4 text-primary" />
              Browse trending tokens
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

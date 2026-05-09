"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ALL_SECTIONS, type NavItem } from "@/lib/navigation";

export function SectionTabs({
  items,
  baseHref,
  className,
}: {
  items?: NavItem[];
  baseHref?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const resolved =
    items ?? (baseHref ? ALL_SECTIONS.find((s) => s.href === baseHref)?.items ?? [] : []);
  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {baseHref && (
          <Link
            href={baseHref}
            className={cn(
              "inline-flex items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border",
              pathname === baseHref
                ? "bg-primary/10 text-primary border-primary/20"
                : "border-white/[0.06] text-muted-foreground hover:text-foreground hover:border-white/15"
            )}
          >
            Overview
          </Link>
        )}
        {resolved.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border",
                active
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "border-white/[0.06] text-muted-foreground hover:text-foreground hover:border-white/15"
              )}
            >
              {item.icon ? <item.icon className="size-3.5" /> : null}
              {item.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

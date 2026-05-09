"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Repeat, Briefcase, BarChart3, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trade", label: "Trade", icon: Repeat },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/tools", label: "Tools", icon: Wrench },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.06] bg-[#0a0c12]/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div className="flex items-stretch justify-around">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles, Zap } from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { SECTIONS, UTILITY_SECTIONS } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const ACCENT_COLORS: Record<string, string> = {
  mint: "from-emerald-400/30 to-emerald-400/0 text-emerald-300",
  purple: "from-fuchsia-400/30 to-fuchsia-400/0 text-fuchsia-300",
  blue: "from-sky-400/30 to-sky-400/0 text-sky-300",
  pink: "from-rose-400/30 to-rose-400/0 text-rose-300",
  orange: "from-amber-400/30 to-amber-400/0 text-amber-300",
};

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col gap-2 sticky top-0 h-screen border-r border-white/[0.06] bg-[#0a0c12]/80 backdrop-blur-xl z-30 transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-[252px]"
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-white/[0.04]">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="relative size-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/30 flex items-center justify-center neon-shadow-mint shrink-0">
            <Zap className="size-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Lumen</div>
              <div className="text-[10px] text-muted-foreground">Solana DeFi</div>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-4 no-scrollbar">
        <div className="px-2 pt-2">
          {!collapsed && (
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-1 mb-1.5">
              Workspace
            </div>
          )}
          <SidebarItem
            href="/"
            label="Home"
            collapsed={collapsed}
            active={pathname === "/"}
            icon={
              <span className="size-4 rounded-sm bg-gradient-to-br from-primary to-accent" />
            }
          />
        </div>

        <div className="px-2 space-y-2">
          {!collapsed && (
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-1">
              Sections
            </div>
          )}
          {SECTIONS.map((section) => (
            <SidebarSection
              key={section.href}
              section={section}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </div>

        <div className="px-2 space-y-1">
          {!collapsed && (
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-1">
              System
            </div>
          )}
          {UTILITY_SECTIONS.map((section) => (
            <SidebarSection
              key={section.href}
              section={section}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </div>
      </nav>

      {!collapsed && (
        <div className="px-3 py-3 border-t border-white/[0.04]">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 size-20 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Sparkles className="size-3" /> Pro tip
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Press{" "}
                <kbd className="rounded bg-white/10 px-1 text-[10px]">⌘K</kbd> to open
                the command palette anywhere.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function SidebarSection({
  section,
  collapsed,
  pathname,
}: {
  section: (typeof SECTIONS)[number];
  collapsed: boolean;
  pathname: string;
}) {
  const isActive = pathname.startsWith(section.href) && section.href !== "/";
  const [open, setOpen] = useState(isActive);
  const Icon = section.icon;
  const colorCls = ACCENT_COLORS[section.accent];

  if (collapsed) {
    return (
      <Link
        href={section.href}
        title={section.title}
        className={cn(
          "group flex items-center justify-center size-10 rounded-lg border border-transparent transition-colors",
          isActive ? "bg-white/[0.04] border-white/[0.06]" : "hover:bg-white/[0.04]"
        )}
      >
        <Icon
          className={cn(
            "size-4",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
          isActive ? "bg-white/[0.04] text-foreground" : "text-foreground/80 hover:bg-white/[0.03]"
        )}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "size-7 rounded-md flex items-center justify-center bg-gradient-to-br border border-white/[0.04]",
              colorCls
            )}
          >
            <Icon className="size-3.5" />
          </span>
          <span className="truncate font-medium">{section.title}</span>
        </span>
        <ChevronRight
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-0.5 border-l border-white/[0.06] pl-3 py-1">
              {section.items.map((item) => {
                const sub = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                      sub
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                    )}
                  >
                    {item.icon ? (
                      <item.icon className="size-3.5 shrink-0" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current opacity-60" />
                    )}
                    <span className="truncate">{item.title}</span>
                    {item.badge ? (
                      <Badge variant="secondary" className="ml-auto text-[9px] py-0 px-1.5">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({
  href,
  label,
  icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-white/[0.04]"
      )}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

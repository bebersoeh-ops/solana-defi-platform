"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SECTIONS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const ACCENT_BG: Record<string, string> = {
  mint: "from-emerald-400/20 via-emerald-400/0 to-transparent",
  purple: "from-fuchsia-400/20 via-fuchsia-400/0 to-transparent",
  blue: "from-sky-400/20 via-sky-400/0 to-transparent",
  pink: "from-rose-400/20 via-rose-400/0 to-transparent",
  orange: "from-amber-400/20 via-amber-400/0 to-transparent",
};

const ACCENT_RING: Record<string, string> = {
  mint: "group-hover:border-emerald-400/30",
  purple: "group-hover:border-fuchsia-400/30",
  blue: "group-hover:border-sky-400/30",
  pink: "group-hover:border-rose-400/30",
  orange: "group-hover:border-amber-400/30",
};

const ACCENT_TEXT: Record<string, string> = {
  mint: "text-emerald-300",
  purple: "text-fuchsia-300",
  blue: "text-sky-300",
  pink: "text-rose-300",
  orange: "text-amber-300",
};

export function MainCards() {
  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
            Sections
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold mt-1">
            Pick a workspace
          </h2>
        </div>
        <p className="hidden sm:block text-xs text-muted-foreground max-w-md text-right">
          Each section opens into a dedicated workspace with submenus,
          dashboards, and pro tooling.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {SECTIONS.map((section, i) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={section.href}
                className={cn(
                  "group block relative overflow-hidden rounded-2xl border border-white/[0.06] glass-card p-5 transition-all hover:-translate-y-1 hover:bg-white/[0.04]",
                  ACCENT_RING[section.accent]
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
                    ACCENT_BG[section.accent]
                  )}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.06]",
                        ACCENT_TEXT[section.accent]
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {section.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {section.items.slice(0, 3).map((item) => (
                      <span
                        key={item.href}
                        className="text-[10px] rounded-full bg-white/[0.04] border border-white/[0.04] px-2 py-0.5 text-muted-foreground"
                      >
                        {item.title}
                      </span>
                    ))}
                    {section.items.length > 3 && (
                      <span className="text-[10px] rounded-full bg-white/[0.04] px-2 py-0.5 text-muted-foreground">
                        +{section.items.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

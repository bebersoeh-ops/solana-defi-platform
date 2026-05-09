"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTIONS, UTILITY_SECTIONS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 left-0 w-[300px] max-w-[90vw] bg-[#0a0c12] border-r border-white/[0.06] z-50 md:hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/30 flex items-center justify-center">
                  <Zap className="size-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Lumen</div>
                  <div className="text-[10px] text-muted-foreground">Solana DeFi</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="size-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              <Link
                href="/"
                onClick={onClose}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  pathname === "/"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-white/[0.04]"
                )}
              >
                Home
              </Link>
              {[...SECTIONS, ...UTILITY_SECTIONS].map((section) => (
                <div key={section.href} className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 px-3">
                    {section.title}
                  </div>
                  <Link
                    href={section.href}
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/[0.04]"
                  >
                    <section.icon className="size-4 text-primary" />
                    Overview
                  </Link>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === item.href
                          ? "bg-white/[0.04] text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                      )}
                    >
                      {item.icon ? <item.icon className="size-3.5" /> : null}
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

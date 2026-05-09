"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ALL_SECTIONS, type NavItem } from "@/lib/navigation";
import { Card, CardContent } from "@/components/ui/card";

export function SectionOverview({
  items,
  baseHref,
}: {
  items?: NavItem[];
  baseHref?: string;
}) {
  const resolved =
    items ?? (baseHref ? ALL_SECTIONS.find((s) => s.href === baseHref)?.items ?? [] : []);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {resolved.map((item, i) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.04 }}
        >
          <Link href={item.href} className="block group">
            <Card className="h-full transition-all group-hover:border-white/15 group-hover:bg-white/[0.04]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.icon ? (
                      <span className="size-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-primary">
                        <item.icon className="size-4" />
                      </span>
                    ) : null}
                    <div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      {item.description ? (
                        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {item.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

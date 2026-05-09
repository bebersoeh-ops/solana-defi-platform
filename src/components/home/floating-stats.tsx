"use client";

import { motion } from "framer-motion";
import { Activity, Coins, Repeat, Users } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

const stats = [
  {
    label: "Aggregated 24h volume",
    value: "$2.84B",
    change: 12.4,
    icon: <Activity className="size-4" />,
    glow: true,
  },
  {
    label: "Routes processed",
    value: "1,284,029",
    change: 4.7,
    icon: <Repeat className="size-4" />,
  },
  {
    label: "Unique traders",
    value: "182,431",
    change: 2.1,
    icon: <Users className="size-4" />,
  },
  {
    label: "Tokens supported",
    value: "12,468",
    change: 0.6,
    icon: <Coins className="size-4" />,
  },
];

export function FloatingStats() {
  return (
    <section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  change,
  hint,
  icon,
  glow,
  className,
}: {
  label: string;
  value: ReactNode;
  change?: number;
  hint?: string;
  icon?: ReactNode;
  glow?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 relative overflow-hidden group transition-all hover:border-white/10",
        glow && "neon-shadow-mint",
        className
      )}
    >
      <div className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {typeof change === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              change >= 0
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            )}
          >
            {change >= 0 ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        ) : null}
        {hint ? (
          <span className="text-muted-foreground/70">{hint}</span>
        ) : null}
      </div>
    </div>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary",
        secondary:
          "border-white/10 bg-white/5 text-foreground/80",
        outline: "border-white/15 bg-transparent text-foreground/80",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-400",
        destructive:
          "border-rose-500/30 bg-rose-500/10 text-rose-400",
        info: "border-sky-500/30 bg-sky-500/10 text-sky-400",
        accent:
          "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
        live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

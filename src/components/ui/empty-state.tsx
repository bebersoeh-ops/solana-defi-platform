import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl border border-dashed border-white/10",
        className
      )}
    >
      {Icon ? (
        <div className="flex size-12 items-center justify-center rounded-full bg-white/[0.04] border border-white/5 mb-4">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      ) : null}
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Badge } from "./badge";

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: {
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          {badge ? (
            <Badge variant="default" className="text-[10px]">
              {badge}
            </Badge>
          ) : null}
        </div>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2 flex-wrap">{actions}</div>
      ) : null}
    </div>
  );
}

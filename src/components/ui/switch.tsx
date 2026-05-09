"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, defaultChecked, onCheckedChange, disabled, className, id }, ref) => {
    const [internal, setInternal] = React.useState(defaultChecked ?? false);
    const value = checked ?? internal;
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => {
          const next = !value;
          if (checked === undefined) setInternal(next);
          onCheckedChange?.(next);
        }}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-white/10 transition-colors",
          value ? "bg-primary/30" : "bg-white/[0.04]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span
          className={cn(
            "inline-block size-4 transform rounded-full transition-transform",
            value
              ? "translate-x-[18px] bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
              : "translate-x-[2px] bg-white/60"
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

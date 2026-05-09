"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const DialogContext = React.createContext<DialogContextValue | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({
  className,
  children,
  size = "md",
}: {
  className?: string;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const ctx = React.useContext(DialogContext);
  if (!ctx?.open) return null;
  const widths: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        role="dialog"
        className={cn(
          "relative w-full rounded-xl border border-white/[0.08] bg-card shadow-2xl",
          widths[size],
          "animate-in fade-in zoom-in-95 duration-200",
          className
        )}
      >
        <button
          onClick={() => ctx.setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1 p-5 pb-3", className)}>{children}</div>
  );
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <h2 className={cn("text-base font-semibold", className)}>{children}</h2>
  );
}

export function DialogDescription({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}

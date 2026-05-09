"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div className="absolute left-0 right-0 h-1.5 rounded-full bg-white/[0.06]" />
      <div
        className="absolute left-0 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent"
        style={{ width: `${pct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className="relative w-full h-1.5 appearance-none bg-transparent cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:shadow-[0_0_12px_hsl(var(--primary)/0.6)]
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-background"
      />
    </div>
  );
}

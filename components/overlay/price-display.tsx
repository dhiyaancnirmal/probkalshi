"use client";

import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  value: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function PriceDisplay({ value, size = "md", className }: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <span
      className={cn(
        "font-mono font-bold tabular-nums text-white",
        sizeClasses[size],
        className
      )}
    >
      {value}%
    </span>
  );
}

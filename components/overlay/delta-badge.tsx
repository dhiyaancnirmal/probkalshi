"use client";

import { cn, formatDelta, getDeltaColor } from "@/lib/utils";

interface DeltaBadgeProps {
  delta: number | null;
  size?: "sm" | "md";
  className?: string;
}

export function DeltaBadge({ delta, size = "md", className }: DeltaBadgeProps) {
  if (delta === null || delta === 0) {
    return null;
  }

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
  };

  return (
    <span
      className={cn(
        "font-medium",
        sizeClasses[size],
        getDeltaColor(delta),
        className
      )}
    >
      {formatDelta(delta)}
    </span>
  );
}

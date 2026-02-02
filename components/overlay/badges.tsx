"use client";

import { cn } from "@/lib/utils";

interface KalshiBadgeProps {
  className?: string;
}

export function KalshiBadge({ className }: KalshiBadgeProps) {
  return (
    <a
      href="https://kalshi.com"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300 transition-colors",
        className
      )}
    >
      <span>via</span>
      <span className="text-[#09C285] font-medium">Kalshi</span>
    </a>
  );
}

interface ProbkalshiBadgeProps {
  className?: string;
}

export function ProbkalshiBadge({ className }: ProbkalshiBadgeProps) {
  return (
    <a
      href="https://probkalshi.com"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-1 text-xs text-gray-500 hover:text-[#09C285] transition-colors",
        className
      )}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      <span>probkalshi.com</span>
    </a>
  );
}

interface SettledBadgeProps {
  result: "yes" | "no";
  className?: string;
}

export function SettledBadge({ result, className }: SettledBadgeProps) {
  const color = result === "yes" ? "bg-[#0AC285]" : "bg-[#D91616]";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase",
        color,
        "text-white",
        className
      )}
    >
      Settled: {result}
    </span>
  );
}

interface StaleBadgeProps {
  className?: string;
}

export function StaleBadge({ className }: StaleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        "bg-yellow-500/20 text-yellow-400",
        className
      )}
    >
      Delayed
    </span>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { buildKalshiUrl } from "@/lib/parse-url";

interface TradeButtonProps {
  ticker: string;
  accent?: string;
  className?: string;
}

export function TradeButton({ ticker, accent = "09C285", className }: TradeButtonProps) {
  const url = buildKalshiUrl(ticker);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium",
        "transition-opacity hover:opacity-80",
        className
      )}
      style={{
        backgroundColor: `#${accent}`,
        color: "#000",
      }}
    >
      Trade on Kalshi
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
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}

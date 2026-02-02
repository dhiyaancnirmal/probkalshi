"use client";

import type { MarketData, OrderbookData, TradeData, OverlayTheme } from "@/lib/types";
import { cn, truncate } from "@/lib/utils";
import { DeltaBadge } from "./delta-badge";
import { StaleBadge, SettledBadge } from "./badges";

interface CompactTickerProps {
  market: MarketData;
  orderbook: OrderbookData | null;
  lastTrade: TradeData | null;
  yesDelta: number | null;
  noDelta: number | null;
  isStale: boolean;
  showTrade: boolean;
  showButton: boolean;
  accent: string;
  theme: OverlayTheme;
}

export function CompactTicker({
  market,
  yesDelta,
  isStale,
  theme,
}: CompactTickerProps) {
  const isSettled = market.status === "settled";

  const bgClass =
    theme === "transparent"
      ? "bg-black/80 backdrop-blur-sm"
      : theme === "dark"
        ? "bg-gray-900"
        : "bg-white";

  const textClass = theme === "light" ? "text-gray-900" : "text-white";
  const subtextClass = theme === "light" ? "text-gray-500" : "text-gray-400";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 px-4 py-2 rounded-full border",
        bgClass,
        theme === "light" ? "border-gray-200" : "border-gray-700/50"
      )}
    >
      {/* Lightning icon */}
      <svg
        className={cn("w-4 h-4 shrink-0", subtextClass)}
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

      {/* Market title (truncated) */}
      <span className={cn("text-sm font-medium", textClass)}>
        {truncate(market.title, 35)}
      </span>

      {/* Divider */}
      <span className={subtextClass}>·</span>

      {/* YES price */}
      <span className={cn("font-mono font-bold", textClass)}>
        YES {market.yesPrice}¢
      </span>

      {/* Delta */}
      {!isSettled && yesDelta !== null && yesDelta !== 0 && (
        <DeltaBadge delta={yesDelta} size="sm" />
      )}

      {/* Status badges */}
      {isStale && <StaleBadge />}
      {isSettled && market.result && (
        <SettledBadge result={market.result as "yes" | "no"} />
      )}

      {/* Kalshi label */}
      <span className={subtextClass}>·</span>
      <span className={cn("text-xs uppercase tracking-wide", subtextClass)}>
        Kalshi
      </span>
    </div>
  );
}

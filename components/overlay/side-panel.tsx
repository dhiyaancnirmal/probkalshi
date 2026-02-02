"use client";

import type { MarketData, OrderbookData, TradeData, OverlayTheme } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { PriceDisplay } from "./price-display";
import { DeltaBadge } from "./delta-badge";
import { SettledBadge, StaleBadge } from "./badges";

interface SidePanelProps {
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

export function SidePanel({
  market,
  lastTrade,
  yesDelta,
  noDelta,
  isStale,
  theme,
}: SidePanelProps) {
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
        "w-[140px] rounded-xl p-4 border",
        bgClass,
        theme === "light" ? "border-gray-200" : "border-gray-700/50"
      )}
    >
      {/* Lightning icon */}
      <div className="flex items-center gap-1.5 mb-3">
        <svg
          className={cn("w-4 h-4", subtextClass)}
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
        {isStale && <StaleBadge />}
      </div>

      {/* Title */}
      <h3 className={cn("text-sm font-medium leading-tight mb-4", textClass)}>
        {market.title}
      </h3>

      {/* Settled badge */}
      {isSettled && market.result && (
        <div className="mb-3">
          <SettledBadge result={market.result as "yes" | "no"} />
        </div>
      )}

      {/* YES price */}
      <div className="mb-3">
        <div className={cn("text-xs font-medium mb-0.5", subtextClass)}>YES</div>
        <PriceDisplay value={market.yesPrice} size="lg" />
        {!isSettled && <DeltaBadge delta={yesDelta} size="sm" className="mt-0.5 block" />}
      </div>

      {/* NO price */}
      <div className="mb-4">
        <div className={cn("text-xs font-medium mb-0.5", subtextClass)}>NO</div>
        <PriceDisplay value={market.noPrice} size="lg" />
        {!isSettled && <DeltaBadge delta={noDelta} size="sm" className="mt-0.5 block" />}
      </div>

      {/* Footer */}
      <div className={cn("text-xs space-y-1", subtextClass)}>
        <div className="uppercase tracking-wide text-[#09C285] font-medium">Kalshi</div>
        {lastTrade && !isSettled && (
          <div>{formatRelativeTime(lastTrade.createdTime)}</div>
        )}
      </div>
    </div>
  );
}

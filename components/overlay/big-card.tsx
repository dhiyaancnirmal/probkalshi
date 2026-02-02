"use client";

import type { MarketData, OrderbookData, TradeData, OverlayTheme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "./price-display";
import { DeltaBadge } from "./delta-badge";
import { LastTrade } from "./last-trade";
import { TradeButton } from "./trade-button";
import { KalshiBadge, ProbkalshiBadge, SettledBadge, StaleBadge } from "./badges";

interface BigCardProps {
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

export function BigCard({
  market,
  lastTrade,
  yesDelta,
  noDelta,
  isStale,
  showTrade,
  showButton,
  accent,
  theme,
}: BigCardProps) {
  const isSettled = market.status === "settled";
  
  const bgClass =
    theme === "transparent"
      ? "bg-black/80 backdrop-blur-sm"
      : theme === "dark"
        ? "bg-gray-900"
        : "bg-white";

  const textClass = theme === "light" ? "text-gray-900" : "text-white";
  const subtextClass = theme === "light" ? "text-gray-600" : "text-gray-400";

  return (
    <div
      className={cn(
        "rounded-xl p-5 min-w-[320px] max-w-[420px] border",
        bgClass,
        theme === "light" ? "border-gray-200" : "border-gray-700/50"
      )}
    >
      {/* Header with status badges */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <h2 className={cn("text-lg font-semibold leading-tight", textClass)}>
          {market.title}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          {isStale && <StaleBadge />}
          {isSettled && market.result && (
            <SettledBadge result={market.result as "yes" | "no"} />
          )}
        </div>
      </div>

      {/* Price boxes */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* YES */}
        <div
          className={cn(
            "rounded-lg p-4 text-center",
            theme === "light" ? "bg-gray-100" : "bg-gray-800/50"
          )}
        >
          <div className={cn("text-sm font-medium mb-1", subtextClass)}>YES</div>
          <PriceDisplay
            value={market.yesPrice}
            size="xl"
            className={cn(isSettled && "opacity-60")}
          />
          {!isSettled && <DeltaBadge delta={yesDelta} className="mt-1 block" />}
        </div>

        {/* NO */}
        <div
          className={cn(
            "rounded-lg p-4 text-center",
            theme === "light" ? "bg-gray-100" : "bg-gray-800/50"
          )}
        >
          <div className={cn("text-sm font-medium mb-1", subtextClass)}>NO</div>
          <PriceDisplay
            value={market.noPrice}
            size="xl"
            className={cn(isSettled && "opacity-60")}
          />
          {!isSettled && <DeltaBadge delta={noDelta} className="mt-1 block" />}
        </div>
      </div>

      {/* Last trade info */}
      {showTrade && lastTrade && !isSettled && (
        <LastTrade trade={lastTrade} className="mb-3" />
      )}

      {/* Trade button */}
      {showButton && !isSettled && (
        <div className="mb-3">
          <TradeButton ticker={market.ticker} accent={accent} className="w-full justify-center" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
        <ProbkalshiBadge />
        <KalshiBadge />
      </div>
    </div>
  );
}

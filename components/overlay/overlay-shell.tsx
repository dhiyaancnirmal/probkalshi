"use client";

import { useEffect } from "react";
import { useKalshiMarket } from "@/hooks/use-kalshi-market";
import { usePriceHistory } from "@/hooks/use-price-history";
import type { OverlayConfig } from "@/lib/types";
import { BigCard } from "./big-card";
import { CompactTicker } from "./compact-ticker";
import { SidePanel } from "./side-panel";

interface OverlayShellProps {
  config: OverlayConfig;
}

export function OverlayShell({ config }: OverlayShellProps) {
  const { ticker, preset, theme, showTrade, showButton, accent } = config;

  const { data, isLoading, isError, error, isStale } = useKalshiMarket(ticker, {
    pollInterval: 5000,
    enabled: Boolean(ticker),
  });

  const { yesDelta, noDelta, addPrice } = usePriceHistory({
    windowMs: 5 * 60 * 1000, // 5 minutes
  });

  // Track price history
  const yesPrice = data?.market?.yesPrice;
  const noPrice = data?.market?.noPrice;
  
  useEffect(() => {
    if (yesPrice !== undefined && noPrice !== undefined) {
      addPrice(yesPrice, noPrice);
    }
  }, [yesPrice, noPrice, addPrice]);

  // Apply theme to root
  const themeClass =
    theme === "transparent"
      ? "bg-transparent"
      : theme === "dark"
        ? "bg-gray-900"
        : "bg-white";

  // Error state
  if (isError && !data) {
    return (
      <div className={`${themeClass} p-4 text-center`}>
        <p className="text-red-400 text-sm">
          {error || "Failed to load market"}
        </p>
      </div>
    );
  }

  // Loading state (only on initial load)
  if (isLoading && !data) {
    return (
      <div className={`${themeClass} p-4 text-center`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const commonProps = {
    market: data.market,
    orderbook: data.orderbook,
    lastTrade: data.lastTrade,
    yesDelta,
    noDelta,
    isStale,
    showTrade,
    showButton,
    accent,
    theme,
  };

  switch (preset) {
    case "compact-ticker":
      return <CompactTicker {...commonProps} />;
    case "side-panel":
      return <SidePanel {...commonProps} />;
    case "big-card":
    default:
      return <BigCard {...commonProps} />;
  }
}

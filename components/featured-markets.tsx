"use client";

import { useState, useEffect, useCallback } from "react";
import type { MarketData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FeaturedMarketsProps {
  onSelectMarket: (ticker: string) => void;
}

export function FeaturedMarkets({ onSelectMarket }: FeaturedMarketsProps) {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const fetchMarkets = useCallback(async () => {
    try {
      const res = await fetch("/api/kalshi/trending");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMarkets(data.markets || []);
    } catch (error) {
      console.error("Failed to fetch trending markets:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    // Refresh every 60 seconds
    const interval = setInterval(fetchMarkets, 60000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-center py-6 text-gray-400">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading live markets...
        </div>
      </div>
    );
  }

  if (markets.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50">
      {/* Header with Kalshi branding */}
      <div className="flex items-center border-b border-gray-800">
        <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-800 bg-gray-900/80">
          <span className="text-sm font-semibold text-[#09C285]">Kalshi</span>
          <span className="text-sm text-gray-400">Live Markets</span>
          <span className="w-2 h-2 bg-[#09C285] rounded-full" />
        </div>
        <div className="flex-1 px-4 py-3">
          <span className="text-xs text-gray-500">
            Hover to pause • Click to embed
          </span>
        </div>
      </div>

      {/* Scrolling ticker */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={cn(
            "flex items-stretch",
            isPaused ? "" : "animate-scroll"
          )}
          style={{
            width: "fit-content",
          }}
        >
          {/* Duplicate markets for seamless loop */}
          {[...markets, ...markets].map((market, index) => (
            <MarketCard
              key={`${market.ticker}-${index}`}
              market={market}
              onSelect={() => onSelectMarket(market.ticker)}
            />
          ))}
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-y-0 left-0 w-4 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-4 pointer-events-none" />
      </div>
    </div>
  );
}

interface MarketCardProps {
  market: MarketData;
  onSelect: () => void;
}

function MarketCard({ market, onSelect }: MarketCardProps) {
  const yesPrice = market.yesPrice ?? 50;
  const isHigh = yesPrice >= 70;
  const isLow = yesPrice <= 30;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex-shrink-0 px-5 py-4 border-r border-gray-800",
        "hover:bg-gray-800/50 transition-colors text-left",
        "focus:outline-none focus:bg-gray-800/50"
      )}
      title={`Click to embed: ${market.title}`}
    >
      <div className="flex flex-col gap-1.5 min-w-[180px] max-w-[220px]">
        {/* Title */}
        <div className="text-sm text-gray-300 line-clamp-2 leading-tight">
          {market.title}
        </div>

        {/* Price and volume */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-lg font-bold",
              isHigh
                ? "text-[#09C285]"
                : isLow
                  ? "text-[#D91616]"
                  : "text-white"
            )}
          >
            {yesPrice}%
          </span>
          {market.volume && market.volume > 0 && (
            <span className="text-xs text-gray-500">
              ${(market.volume / 100).toLocaleString()} vol
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

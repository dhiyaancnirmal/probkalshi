"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { MarketData } from "@/lib/types";
import { cn } from "@/lib/utils";

function TickerContent() {
  const searchParams = useSearchParams();

  // Get params with defaults
  const theme = (searchParams.get("theme") as "dark" | "light") || "dark";
  const speed = parseInt(searchParams.get("speed") || "20", 10);
  const height = parseInt(searchParams.get("height") || "80", 10);
  const category = searchParams.get("category") || "all";

  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch markets
  const fetchMarkets = useCallback(async () => {
    try {
      const url =
        category && category !== "all"
          ? `/api/kalshi/trending?category=${category}`
          : "/api/kalshi/trending";

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMarkets(data.markets || []);
    } catch (error) {
      console.error("Failed to fetch markets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  const isLight = theme === "light";
  const mutedTextClass = isLight ? "text-zinc-600" : "text-zinc-400";
  const textClass = isLight ? "text-zinc-900" : "text-white";
  const borderClass = isLight ? "border-zinc-200" : "border-zinc-800";

  return (
    <div
      className={cn(
        "flex w-full overflow-hidden",
        isLight ? "bg-white" : "bg-zinc-950"
      )}
      style={{
        height: `${height}px`,
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Kalshi Branding */}
      <a
        href="https://kalshi.com"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center px-3 shrink-0",
          "hover:opacity-80 transition-opacity",
          "border-r",
          borderClass
        )}
      >
        <span className="text-xl font-bold tracking-tight text-[#09C285]">Kalshi</span>
      </a>

      {/* Scrolling Ticker */}
      <div
        className="relative flex-1 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {isLoading ? (
          <div className={cn("flex items-center justify-center h-full text-pretty", mutedTextClass)}>
            Loading...
          </div>
        ) : markets.length === 0 ? (
          <div className={cn("flex items-center justify-center h-full text-pretty", mutedTextClass)}>
            No markets available
          </div>
        ) : (
          <div
            className="flex items-center h-full"
            style={{
              animation: isPaused ? "none" : `scroll ${speed}s linear infinite`,
              width: "fit-content",
            }}
          >
            {/* Duplicate markets for seamless loop */}
            {[...markets, ...markets].map((market, index) => (
              <TickerItem
                key={`${market.ticker}-${index}`}
                market={market}
                theme={theme}
                height={height}
                textClass={textClass}
                mutedTextClass={mutedTextClass}
                borderClass={borderClass}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual ticker item
function TickerItem({
  market,
  theme,
  height,
  textClass,
  mutedTextClass,
  borderClass,
}: {
  market: MarketData;
  theme: "dark" | "light";
  height: number;
  textClass: string;
  mutedTextClass: string;
  borderClass: string;
}) {
  // Scale dimensions based on height
  const scale = height / 80;
  const titleSize = Math.max(10, Math.round(14 * scale));
  const priceSize = Math.max(12, Math.round(18 * scale));
  const padding = Math.max(12, Math.round(24 * scale));
  const maxWidth = Math.max(120, Math.round(200 * scale));
  const gap = Math.max(6, Math.round(12 * scale));

  const isCompact = height < 50;
  const yesPrice = market.yesPrice ?? 50;

  // Price color based on probability
  const priceClass =
    yesPrice >= 70
      ? "text-[#09C285]"
      : yesPrice <= 30
        ? "text-[#D91616]"
        : textClass;

  return (
    <a
      href={`https://kalshi.com/markets/${market.ticker}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center shrink-0 h-full border-r",
        borderClass,
        theme === "light" ? "hover:bg-black/5" : "hover:bg-white/5"
      )}
      style={{
        padding: `0 ${padding}px`,
        gap: `${gap}px`,
      }}
    >
      {isCompact ? (
        // Compact layout: title and price side by side
        <>
          <span
            className={mutedTextClass}
            style={{
              fontSize: titleSize,
              maxWidth,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {market.title}
          </span>
          <span
            className={cn("font-bold tabular-nums", priceClass)}
            style={{
              fontSize: priceSize,
            }}
          >
            {yesPrice}%
          </span>
        </>
      ) : (
        // Standard layout: title above price
        <div className="flex flex-col justify-center">
          <div
            className={mutedTextClass}
            style={{
              fontSize: titleSize,
              maxWidth,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.2,
            }}
          >
            {market.title}
          </div>
          <div className="flex items-center" style={{ gap: "4px" }}>
            <span
              className={cn("font-bold tabular-nums", priceClass)}
              style={{
                fontSize: priceSize,
                lineHeight: 1,
              }}
            >
              {yesPrice}%
            </span>
            <span
              style={{
                color: "#09C285",
                fontSize: Math.max(8, Math.round(10 * scale)),
                fontWeight: 500,
              }}
            >
              YES
            </span>
          </div>
        </div>
      )}
    </a>
  );
}

// Main page component with Suspense boundary
export default function TickerEmbedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-20 bg-[#0f0f0f] text-zinc-400">
          Loading ticker...
        </div>
      }
    >
      <TickerContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { MarketData } from "@/lib/types";
import { cn, formatProbability, formatPrice } from "@/lib/utils";

function MarketContent() {
  const searchParams = useSearchParams();

  // Get params
  const ticker = searchParams.get("ticker");
  const theme = (searchParams.get("theme") as "dark" | "light") || "dark";

  const [market, setMarket] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) {
      setError("No ticker specified");
      setIsLoading(false);
      return;
    }

    const fetchMarket = async () => {
      try {
        const res = await fetch(`/api/kalshi/market/${ticker}`);
        if (!res.ok) throw new Error("Market not found");
        const data = await res.json();
        setMarket(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load market");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarket();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchMarket, 10000);
    return () => clearInterval(interval);
  }, [ticker]);

  const isLight = theme === "light";

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-full h-full text-pretty",
          isLight ? "bg-white text-zinc-600" : "bg-zinc-950 text-zinc-400"
        )}
        style={{
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Loading market...
      </div>
    );
  }

  if (error || !market) {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-full h-full text-pretty",
          isLight ? "bg-white text-zinc-600" : "bg-zinc-950 text-zinc-400"
        )}
        style={{
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div className="text-center p-4">
          <p className="text-lg mb-2 text-balance">
            {error || "Market not found"}
          </p>
          {!ticker && (
            <p className="text-sm opacity-70 text-pretty">
              Add <code className={cn("px-1 rounded", isLight ? "bg-zinc-100" : "bg-zinc-900")}>?ticker=TICKER</code> to the URL
            </p>
          )}
        </div>
      </div>
    );
  }

  const yesPrice = market.yesPrice ?? 50;
  const noPrice = market.noPrice ?? 50;

  // Determine the color based on probability
  const probabilityClass = yesPrice <= 30 ? "text-[#D91616]" : "text-[#09C285]";

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center p-4",
        isLight ? "bg-white" : "bg-zinc-950"
      )}
      style={{
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <a
        href={`https://kalshi.com/markets/${market.ticker}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full max-w-md"
        style={{
          textDecoration: "none",
        }}
      >
        <div
          className={cn(
            "rounded-2xl overflow-hidden border",
            isLight ? "bg-zinc-100 border-zinc-200" : "bg-zinc-900 border-zinc-800"
          )}
        >
          {/* Header with Kalshi branding */}
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3 border-b",
              isLight ? "border-zinc-200" : "border-zinc-800"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#09C285]">Kalshi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#09C285]" />
              <span className={cn("text-xs", isLight ? "text-zinc-600" : "text-zinc-400")}>
                Live
              </span>
            </div>
          </div>

          {/* Market content */}
          <div className="p-4">
            {/* Market title */}
            <h3
              className={cn(
                "text-lg font-semibold mb-4 leading-tight line-clamp-2 text-balance",
                isLight ? "text-zinc-900" : "text-white"
              )}
            >
              {market.title}
            </h3>

            {/* Probability display */}
            <div className="flex items-baseline gap-2 mb-4">
              <span
                className={cn("text-4xl font-bold tabular-nums", probabilityClass)}
              >
                {formatProbability(yesPrice)}
              </span>
              <span className={cn("text-sm font-medium text-pretty", isLight ? "text-zinc-600" : "text-zinc-400")}>
                chance
              </span>
            </div>

            {/* Probability bar */}
            <div
              className={cn(
                "h-2 rounded-full overflow-hidden mb-4",
                isLight ? "bg-zinc-200" : "bg-zinc-800"
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full",
                  probabilityClass === "text-[#D91616]" ? "bg-[#D91616]" : "bg-[#09C285]"
                )}
                style={{
                  width: `${yesPrice}%`,
                }}
              />
            </div>

            {/* YES/NO prices */}
            <div className="flex gap-3">
              <div className="flex-1 py-2 px-3 rounded-lg text-center border border-[#09C285]/20 bg-[#09C285]/10">
                <div className="text-xs font-medium mb-0.5 text-[#09C285]">
                  YES
                </div>
                <div className="text-lg font-bold text-[#09C285] tabular-nums">
                  {formatPrice(yesPrice)}
                </div>
              </div>
              <div className="flex-1 py-2 px-3 rounded-lg text-center border border-[#D91616]/20 bg-[#D91616]/10">
                <div className="text-xs font-medium mb-0.5 text-[#D91616]">
                  NO
                </div>
                <div className="text-lg font-bold text-[#D91616] tabular-nums">
                  {formatPrice(noPrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={cn(
              "px-4 py-2 text-center border-t",
              isLight ? "border-zinc-200 bg-black/5" : "border-zinc-800 bg-white/5"
            )}
          >
            <span className={cn("text-xs text-pretty", isLight ? "text-zinc-600" : "text-zinc-400")}>
              Click to trade on{" "}
              <span style={{ color: "#09C285" }}>Kalshi</span>
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}

// Main page component with Suspense boundary
export default function MarketEmbedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full h-full min-h-[240px] bg-[#0f0f0f] text-zinc-400">
          Loading market...
        </div>
      }
    >
      <MarketContent />
    </Suspense>
  );
}

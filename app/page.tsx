"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  UrlInput,
  PresetSelector,
  ThemePicker,
  ToggleOptions,
  OutputPanel,
  LivePreview,
} from "@/components/configurator";
import type { MarketData, OverlayPreset, OverlayTheme } from "@/lib/types";
import { DEFAULT_OVERLAY_CONFIG } from "@/lib/types";

export default function HomePage() {
  // Lifted URL input state for proper control
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [market, setMarket] = useState<MarketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<OverlayPreset>(DEFAULT_OVERLAY_CONFIG.preset);
  const [theme, setTheme] = useState<OverlayTheme>(DEFAULT_OVERLAY_CONFIG.theme);
  const [showTrade, setShowTrade] = useState(DEFAULT_OVERLAY_CONFIG.showTrade);
  const [showButton, setShowButton] = useState(DEFAULT_OVERLAY_CONFIG.showButton);

  // Shared resolve function
  const resolveUrl = useCallback(async (url: string) => {
    if (!url.trim()) {
      setError("Please enter a Kalshi URL or ticker");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/resolve?url=${encodeURIComponent(url.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resolve URL");
        return;
      }

      if (data.type === "market" && data.market) {
        setMarket(data.market);
        setError(null);
      } else if (data.type === "event" && data.event?.markets?.length > 0) {
        // For now, just pick the first market from the event
        setMarket(data.event.markets[0]);
        setError(null);
      } else {
        setError("Could not find a market at that URL");
      }
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResolve = (resolvedMarket: MarketData) => {
    setMarket(resolvedMarket);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleTryExample = (url: string) => {
    setInputValue(url);
    resolveUrl(url);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-8">
        <div className="text-center mb-12">
          {/* Logo / Icon with Kalshi green gradient */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#09C285] to-[#003221] mb-6">
            <svg
              className="w-8 h-8 text-white"
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
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Live{" "}
            <span className="text-[#09C285]">Kalshi</span>{" "}
            odds on your stream
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Free OBS overlay for Kalshi prediction markets. Paste a URL, get a
            live ticker. Real-time updates, animated prices, transparent background.
          </p>
        </div>

        {/* URL Input */}
        <div className="max-w-2xl mx-auto mb-4">
          <UrlInput
            value={inputValue}
            onChange={setInputValue}
            onResolve={handleResolve}
            onError={handleError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-[#D91616]/10 border border-[#D91616]/30 rounded-lg px-4 py-3 text-[#D91616] text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Example links */}
        {!market && (
          <div className="text-center text-sm text-gray-500 mb-8">
            <span>Try: </span>
            <button
              onClick={() => handleTryExample("KXELONMARS-99")}
              disabled={isLoading}
              className="text-[#09C285] hover:underline disabled:opacity-50"
            >
              Elon Musk visits Mars
            </button>
            <span className="mx-2">·</span>
            <button
              onClick={() => handleTryExample("KXNEWPOPE-70")}
              disabled={isLoading}
              className="text-[#09C285] hover:underline disabled:opacity-50"
            >
              Next Pope
            </button>
          </div>
        )}
      </div>

      {/* Configurator (shows after market is selected) */}
      {market && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8">
            {/* Market info header */}
            <div className="mb-8 pb-6 border-b border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/kalshi-logo.png"
                    alt="Kalshi"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{market.title}</h2>
                    <p className="text-sm text-gray-500">
                      Ticker: <code className="bg-gray-800 px-1.5 py-0.5 rounded text-[#09C285]">{market.ticker}</code>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMarket(null);
                    setInputValue("");
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Change market
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left column: Settings */}
              <div className="space-y-6">
                <PresetSelector value={preset} onChange={setPreset} />
                <ThemePicker value={theme} onChange={setTheme} />
                <ToggleOptions
                  showTrade={showTrade}
                  showButton={showButton}
                  onShowTradeChange={setShowTrade}
                  onShowButtonChange={setShowButton}
                />
              </div>

              {/* Right column: Preview & Output */}
              <div className="space-y-6">
                <LivePreview
                  config={{
                    ticker: market.ticker,
                    preset,
                    theme,
                    showTrade,
                    showButton,
                    accent: DEFAULT_OVERLAY_CONFIG.accent,
                  }}
                />
                <OutputPanel
                  config={{
                    ticker: market.ticker,
                    preset,
                    theme,
                    showTrade,
                    showButton,
                    accent: DEFAULT_OVERLAY_CONFIG.accent,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p className="mb-2">
            Not affiliated with Kalshi. Market data provided by{" "}
            <a
              href="https://kalshi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#09C285] hover:underline"
            >
              Kalshi
            </a>
            .
          </p>
          <p>
            Built for streamers, news desks, and prediction market enthusiasts.
          </p>
        </div>
      </footer>
    </main>
  );
}

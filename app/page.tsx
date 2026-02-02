"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { MarketData } from "@/lib/types";

interface SeriesOption {
  seriesTicker: string;
  label: string;
}

export default function HomePage() {
  // Ticker state
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLoadingTicker, setIsLoadingTicker] = useState(true);
  const [tickerTheme, setTickerTheme] = useState<"dark" | "light">("dark");
  const [tickerSpeed, setTickerSpeed] = useState(20);
  const [tickerHeight, setTickerHeight] = useState(80);
  const [tickerCategory, setTickerCategory] = useState("all");
  const [isPaused, setIsPaused] = useState(false);
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([
    { seriesTicker: "all", label: "All" }
  ]);

  // Single market widget state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MarketData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [marketUrl, setMarketUrl] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  const [singleMarketTheme, setSingleMarketTheme] = useState<"dark" | "light">("dark");

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch series list on mount
  const fetchSeriesList = useCallback(async () => {
    try {
      const res = await fetch("/api/kalshi/series-list");
      if (!res.ok) throw new Error("Failed to fetch series list");
      const data = await res.json();
      setSeriesList([
        { seriesTicker: "all", label: "All" },
        ...data.series
      ]);
    } catch (error) {
      console.error("Failed to fetch series list:", error);
    }
  }, []);

  useEffect(() => {
    fetchSeriesList();
  }, [fetchSeriesList]);

  // Fetch trending markets for ticker
  const fetchMarkets = useCallback(async () => {
    try {
      // Build URL with series_ticker filter for categories
      let url = "/api/kalshi/trending";
      if (tickerCategory && tickerCategory !== "all") {
        url += `?series_ticker=${encodeURIComponent(tickerCategory)}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMarkets(data.markets || []);
    } catch (error) {
      console.error("Failed to fetch trending markets:", error);
    } finally {
      setIsLoadingTicker(false);
    }
  }, [tickerCategory]);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  // Search markets
  const searchMarkets = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/resolve?url=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.type === "market" && data.market) {
          setSearchResults([data.market]);
        } else {
          setSearchResults([]);
        }
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setShowSearchResults(true);
    }
  }, []);

  // Handle search input
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchMarkets(value), 300);
  };

  // Handle URL input
  const handleUrlInput = async (value: string) => {
    setMarketUrl(value);
    if (!value.trim()) return;

    try {
      const res = await fetch(`/api/resolve?url=${encodeURIComponent(value.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.type === "market" && data.market) {
          setSelectedMarket(data.market);
        }
      }
    } catch {
      // Ignore errors
    }
  };

  // Select a market
  const selectMarket = (market: MarketData) => {
    setSelectedMarket(market);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Clear selected market
  const clearSelectedMarket = () => {
    setSelectedMarket(null);
    setMarketUrl("");
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, buttonId: string) => {
    await navigator.clipboard.writeText(text);
    const btn = document.getElementById(buttonId);
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Copied!`;
      setTimeout(() => {
        btn.innerHTML = original;
      }, 2000);
    }
  };

  // Generate embed codes
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const tickerEmbedUrl = tickerCategory && tickerCategory !== "all"
    ? `${baseUrl}/embed/ticker?theme=${tickerTheme}&speed=${tickerSpeed}&height=${tickerHeight}&series_ticker=${encodeURIComponent(tickerCategory)}`
    : `${baseUrl}/embed/ticker?theme=${tickerTheme}&speed=${tickerSpeed}&height=${tickerHeight}`;
  const tickerEmbedCode = `<iframe\n  src="${tickerEmbedUrl}"\n  width="100%"\n  height="${tickerHeight}"\n  frameborder="0"\n></iframe>`;

  const singleMarketEmbedUrl = selectedMarket
    ? `${baseUrl}/embed/market?ticker=${selectedMarket.ticker}&theme=${singleMarketTheme}`
    : "";
  const singleMarketEmbedCode = selectedMarket
    ? `<iframe\n  src="${singleMarketEmbedUrl}"\n  width="400"\n  height="240"\n  frameborder="0"\n></iframe>`
    : "Select a market to generate embed code";

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-sm text-zinc-400 mb-6">
            <span className="w-2 h-2 bg-[#09C285] rounded-full" />
            Live Data
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
            <span className="text-[#09C285]">Kalshi</span> Livestream Ticker
          </h1>
          <p className="text-base md:text-xl text-zinc-400 max-w-2xl mx-auto px-2 text-pretty">
            Add live prediction market odds to your livestream or website.
          </p>
        </div>

        {/* Live Ticker Preview */}
        <div className="mb-10 md:mb-16">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Live Preview
          </h2>
          <div
            className={`relative overflow-hidden rounded-xl border flex ${
              tickerTheme === "light"
                ? "bg-white border-zinc-300"
                : "bg-[#0f0f0f] border-zinc-800"
            }`}
            style={{ height: `${tickerHeight}px` }}
          >
            {/* Kalshi Branding */}
            <a
              href="https://kalshi.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center px-6 border-r shrink-0 hover:opacity-80 transition-opacity ${
                tickerTheme === "light"
                  ? "bg-white border-zinc-300"
                  : "bg-[#0f0f0f] border-zinc-700"
              }`}
            >
              <span className="text-xl font-bold tracking-tight text-[#09C285]">Kalshi</span>
            </a>

            {/* Ticker Content */}
            <div
              className="relative flex-1 overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {isLoadingTicker ? (
                <div className="flex items-center justify-center h-full text-zinc-400">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading live markets from <span className="text-[#09C285] ml-1 text-xl font-bold tracking-tight">Kalshi</span>...
                </div>
              ) : (
                <div
                  className="flex items-center h-full"
                  style={{
                    animation: isPaused ? "none" : `scroll ${tickerSpeed}s linear infinite`,
                    width: "fit-content",
                  }}
                >
                  {[...markets, ...markets].map((market, index) => (
                    <TickerItem
                      key={`${market.ticker}-${index}`}
                      market={market}
                      theme={tickerTheme}
                      height={tickerHeight}
                    />
                  ))}
                </div>
              )}

              {/* Gradient overlays */}
              <div className="absolute inset-y-0 left-0 w-4 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-4 pointer-events-none" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2 text-center">
            Hover to pause • Click market to trade on <span className="text-[#09C285]">Kalshi</span>
          </p>
        </div>

        {/* Customization Section */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          {/* Left: Customize */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
              Customize Your Ticker
            </h2>
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">Theme</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTickerTheme("dark")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium min-h-[48px] transition-colors ${
                      tickerTheme === "dark"
                        ? "border-white bg-zinc-900 text-white"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setTickerTheme("light")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium min-h-[48px] transition-colors ${
                      tickerTheme === "light"
                        ? "border-white bg-zinc-900 text-white"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>

              {/* Scroll Speed */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">Scroll Speed</label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={tickerSpeed}
                  onChange={(e) => setTickerSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>Fast</span>
                  <span>{tickerSpeed}s</span>
                  <span>Slow</span>
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">Height</label>
                <input
                  type="range"
                  min="32"
                  max="120"
                  value={tickerHeight}
                  onChange={(e) => setTickerHeight(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>32px</span>
                  <span>{tickerHeight}px</span>
                  <span>120px</span>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {seriesList.map((series) => (
                    <button
                      key={series.seriesTicker}
                      onClick={() => setTickerCategory(series.seriesTicker)}
                      className={`px-3 py-2 md:py-1.5 rounded-lg border-2 text-sm font-medium min-h-[40px] transition-colors ${
                        tickerCategory === series.seriesTicker
                          ? "border-white bg-zinc-900 text-white"
                          : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {series.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Embed Code */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Embed Code</h2>
            <div className="bg-[#1a1a1a] rounded-lg p-4 overflow-x-auto font-mono text-sm text-[#09C285] mb-4">
              <pre>{tickerEmbedCode}</pre>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="copy-ticker-btn"
                onClick={() => copyToClipboard(tickerEmbedCode, "copy-ticker-btn")}
                className="flex-1 py-3 px-4 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              <button
                onClick={() => window.open(tickerEmbedUrl, "_blank")}
                className="flex-1 py-3 px-4 rounded-lg bg-zinc-800 text-white font-semibold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 border border-zinc-700 min-h-[48px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Single Market Widget Section */}
        <div className="mb-12 md:mb-16 pt-8 border-t border-zinc-800">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Single Market Widget</h2>
            <p className="text-zinc-400">
              Embed a specific <span className="text-[#09C285]">Kalshi</span> prediction market card on your website
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Left: Select Market */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Select Market</h3>
              <div className="space-y-6">
                {/* Search Input */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-3">Search Markets</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                      placeholder="Search for a market..."
                      className="w-full py-3 px-4 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 min-h-[48px]"
                    />
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
                        {searchResults.map((m) => (
                          <button
                            key={m.ticker}
                            onClick={() => selectMarket(m)}
                            className="w-full px-4 py-3 hover:bg-zinc-700 text-left border-b border-zinc-700 last:border-b-0"
                          >
                            <div className="text-white text-sm truncate">{m.title}</div>
                            <div className="text-zinc-400 text-xs">{m.yesPrice}% YES</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-3">Or Enter Market URL/Ticker</label>
                  <input
                    type="text"
                    value={marketUrl}
                    onChange={(e) => handleUrlInput(e.target.value)}
                    placeholder="e.g., KXELONMARS-99 or full URL"
                    className="w-full py-3 px-4 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 min-h-[48px]"
                  />
                </div>

                {/* Selected Market Display */}
                {selectedMarket && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Selected Market</label>
                    <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-zinc-900 border border-zinc-700">
                      <div className="flex-1 min-w-0">
                        <div className="text-white truncate">{selectedMarket.title}</div>
                        <div className="text-sm text-zinc-400">{selectedMarket.yesPrice}% YES</div>
                      </div>
                      <button
                        onClick={clearSelectedMarket}
                        className="text-zinc-500 hover:text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-3">Theme</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSingleMarketTheme("dark")}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium min-h-[48px] transition-colors ${
                        singleMarketTheme === "dark"
                          ? "border-white bg-zinc-900 text-white"
                          : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setSingleMarketTheme("light")}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium min-h-[48px] transition-colors ${
                        singleMarketTheme === "light"
                          ? "border-white bg-zinc-900 text-white"
                          : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      Light
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview + Embed Code */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Preview</h3>
              <div className="mb-6">
                <div
                  className="rounded-2xl overflow-hidden border border-zinc-700"
                  style={{ maxWidth: "400px", height: "240px" }}
                >
                  {selectedMarket ? (
                    <iframe
                      src={singleMarketEmbedUrl}
                      style={{ width: "100%", height: "240px", border: "none" }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-zinc-900 text-zinc-500">
                      Select a market to see the preview
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg md:text-xl font-semibold mb-4">Embed Code</h3>
              <div className="bg-[#1a1a1a] rounded-lg p-4 overflow-x-auto font-mono text-sm text-[#09C285] mb-4">
                <pre>{singleMarketEmbedCode}</pre>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="copy-single-btn"
                  onClick={() => selectedMarket && copyToClipboard(singleMarketEmbedCode, "copy-single-btn")}
                  disabled={!selectedMarket}
                  className="flex-1 py-3 px-4 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={() => selectedMarket && window.open(singleMarketEmbedUrl, "_blank")}
                  disabled={!selectedMarket}
                  className="flex-1 py-3 px-4 rounded-lg bg-zinc-800 text-white font-semibold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 border border-zinc-700 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-zinc-800">
          <a
            href="https://kalshi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Powered by <span className="font-semibold text-[#09C285]">Kalshi</span>
          </a>
        </div>
      </div>
    </main>
  );
}

// Ticker Item Component
function TickerItem({
  market,
  theme,
  height,
}: {
  market: MarketData;
  theme: "dark" | "light";
  height: number;
}) {
  const scale = height / 80;
  const titleSize = Math.max(10, Math.round(14 * scale));
  const priceSize = Math.max(12, Math.round(18 * scale));
  const padding = Math.max(12, Math.round(24 * scale));
  const maxWidth = Math.max(120, Math.round(200 * scale));

  const isCompact = height < 50;
  const titleColor = theme === "light" ? "text-zinc-600" : "text-zinc-400";
  const priceColor = theme === "light" ? "text-black" : "text-white";
  const borderColor = theme === "light" ? "border-zinc-300" : "border-zinc-800";

  const yesPrice = market.yesPrice ?? 50;
  const priceClass = yesPrice >= 70 ? "text-[#09C285]" : yesPrice <= 30 ? "text-[#D91616]" : priceColor;

  return (
    <a
      href={`https://kalshi.com/markets/${market.ticker}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center border-r ${borderColor} hover:bg-white/5 transition-colors shrink-0 h-full`}
      style={{ padding: `0 ${padding}px`, gap: `${Math.max(6, 12 * scale)}px` }}
    >
      {isCompact ? (
        <>
          <span className={`${titleColor} truncate`} style={{ fontSize: titleSize, maxWidth }}>
            {market.title}
          </span>
          <span className={`font-bold ${priceClass}`} style={{ fontSize: priceSize }}>
            {yesPrice}%
          </span>
        </>
      ) : (
        <div className="flex flex-col justify-center">
          <div className={`${titleColor} truncate`} style={{ fontSize: titleSize, maxWidth, lineHeight: 1.2 }}>
            {market.title}
          </div>
          <div className="flex items-center gap-1">
            <span className={`font-bold ${priceClass}`} style={{ fontSize: priceSize, lineHeight: 1 }}>
              {yesPrice}%
            </span>
          </div>
        </div>
      )}
    </a>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CombinedMarketData, MarketData, OrderbookData, TradeData } from "@/lib/types";

interface UseKalshiMarketOptions {
  pollInterval?: number; // milliseconds
  enabled?: boolean;
}

interface UseKalshiMarketResult {
  data: CombinedMarketData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isStale: boolean;
  refetch: () => Promise<void>;
}

export function useKalshiMarket(
  ticker: string | null,
  options: UseKalshiMarketOptions = {}
): UseKalshiMarketResult {
  const { pollInterval = 5000, enabled = true } = options;

  const [data, setData] = useState<CombinedMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  const lastFetchRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!ticker) return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Fetch all three endpoints in parallel
      const [marketRes, orderbookRes, tradesRes] = await Promise.all([
        fetch(`/api/kalshi/market/${ticker}`, { signal }),
        fetch(`/api/kalshi/orderbook/${ticker}`, { signal }),
        fetch(`/api/kalshi/trades/${ticker}`, { signal }),
      ]);

      // Check for errors
      if (!marketRes.ok) {
        const errorData = await marketRes.json();
        throw new Error(errorData.error || "Failed to fetch market");
      }

      const [marketData, orderbookData, tradesData] = await Promise.all([
        marketRes.json() as Promise<{ market: MarketData }>,
        orderbookRes.ok ? (orderbookRes.json() as Promise<{ orderbook: OrderbookData }>) : null,
        tradesRes.ok ? (tradesRes.json() as Promise<{ trade: TradeData | null }>) : null,
      ]);

      const combined: CombinedMarketData = {
        market: marketData.market,
        orderbook: orderbookData?.orderbook ?? null,
        lastTrade: tradesData?.trade ?? null,
        fetchedAt: Date.now(),
      };

      setData(combined);
      setError(null);
      setIsStale(false);
      lastFetchRef.current = Date.now();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Ignore abort errors
      }

      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);

      // Mark as stale but keep showing old data
      if (data) {
        setIsStale(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [ticker, data]);

  // Initial fetch
  useEffect(() => {
    if (!enabled || !ticker) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [ticker, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling
  useEffect(() => {
    if (!enabled || !ticker || pollInterval <= 0) return;

    const interval = setInterval(() => {
      fetchData();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [ticker, enabled, pollInterval, fetchData]);

  return {
    data,
    isLoading,
    isError: error !== null,
    error,
    isStale,
    refetch: fetchData,
  };
}

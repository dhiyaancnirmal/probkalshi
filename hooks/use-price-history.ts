"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PricePoint {
  timestamp: number;
  yesPrice: number;
  noPrice: number;
}

interface UsePriceHistoryOptions {
  windowMs?: number; // How far back to track (default 5 minutes)
  maxPoints?: number; // Maximum points to store (default 100)
}

interface UsePriceHistoryResult {
  yesDelta: number | null; // Change in yes price from windowMs ago
  noDelta: number | null;
  oldestYesPrice: number | null;
  oldestNoPrice: number | null;
  history: PricePoint[];
  addPrice: (yesPrice: number, noPrice: number) => void;
}

export function usePriceHistory(
  options: UsePriceHistoryOptions = {}
): UsePriceHistoryResult {
  const { windowMs = 5 * 60 * 1000, maxPoints = 100 } = options;

  const [history, setHistory] = useState<PricePoint[]>([]);
  const historyRef = useRef<PricePoint[]>([]);

  // Keep ref in sync with state for use in callbacks
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Clean up old points periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const cutoff = Date.now() - windowMs;
      setHistory((prev) => prev.filter((p) => p.timestamp > cutoff));
    }, 30000); // Clean up every 30 seconds

    return () => clearInterval(cleanup);
  }, [windowMs]);

  const addPrice = useCallback(
    (yesPrice: number, noPrice: number) => {
      const now = Date.now();
      const cutoff = now - windowMs;

      setHistory((prev) => {
        // Filter out old points and add new one
        const filtered = prev.filter((p) => p.timestamp > cutoff);
        const newHistory = [...filtered, { timestamp: now, yesPrice, noPrice }];

        // Limit total points
        if (newHistory.length > maxPoints) {
          return newHistory.slice(-maxPoints);
        }

        return newHistory;
      });
    },
    [windowMs, maxPoints]
  );

  // Calculate deltas
  const calculateDeltas = useCallback((): {
    yesDelta: number | null;
    noDelta: number | null;
    oldestYesPrice: number | null;
    oldestNoPrice: number | null;
  } => {
    if (history.length < 2) {
      return {
        yesDelta: null,
        noDelta: null,
        oldestYesPrice: null,
        oldestNoPrice: null,
      };
    }

    const current = history[history.length - 1];
    const oldest = history[0];

    return {
      yesDelta: current.yesPrice - oldest.yesPrice,
      noDelta: current.noPrice - oldest.noPrice,
      oldestYesPrice: oldest.yesPrice,
      oldestNoPrice: oldest.noPrice,
    };
  }, [history]);

  const { yesDelta, noDelta, oldestYesPrice, oldestNoPrice } = calculateDeltas();

  return {
    yesDelta,
    noDelta,
    oldestYesPrice,
    oldestNoPrice,
    history,
    addPrice,
  };
}

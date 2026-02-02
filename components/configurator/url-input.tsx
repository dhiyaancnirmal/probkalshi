"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import type { MarketData } from "@/lib/types";

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onResolve: (market: MarketData) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  className?: string;
}

export function UrlInput({
  value,
  onChange,
  onResolve,
  onError,
  isLoading,
  setIsLoading,
  className,
}: UrlInputProps) {
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!value.trim()) {
        onError("Please enter a Kalshi URL or ticker");
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch(
          `/api/resolve?url=${encodeURIComponent(value.trim())}`
        );
        const data = await res.json();

        if (!res.ok) {
          onError(data.error || "Failed to resolve URL");
          return;
        }

        if (data.type === "market" && data.market) {
          onResolve(data.market);
        } else if (data.type === "event" && data.event?.markets?.length > 0) {
          // For now, just pick the first market from the event
          // TODO: Show market picker for multi-market events
          onResolve(data.event.markets[0]);
        } else {
          onError("Could not find a market at that URL");
        }
      } catch {
        onError("Failed to connect. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [value, onResolve, onError, setIsLoading]
  );

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste a Kalshi URL or ticker..."
          className={cn(
            "flex-1 px-4 py-3 rounded-lg",
            "bg-gray-800 border border-gray-700",
            "text-white placeholder-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-[#09C285] focus:border-transparent",
            "transition-all"
          )}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className={cn(
            "px-6 py-3 rounded-lg font-semibold",
            "bg-[#09C285] text-black",
            "hover:bg-[#0AD990] transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2"
          )}
        >
          {isLoading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading
            </>
          ) : (
            <>
              Go
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

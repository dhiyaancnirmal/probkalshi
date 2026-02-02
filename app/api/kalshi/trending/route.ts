import { NextResponse } from "next/server";
import { normalizeMarket } from "@/lib/kalshi";
import type { MarketData } from "@/lib/types";

const KALSHI_API_BASE = "https://api.elections.kalshi.com/trade-api/v2";

// Curated list of interesting/popular event tickers
const FEATURED_EVENTS = [
  "KXELONMARS-99",
  "KXNEWPOPE-70",
  "KXCOLONIZEMARS-50",
  "KXWARMING-50",
  "KXMARSVRAIL-50",
  "KXPERSONPRESMAM-45",
];

export async function GET() {
  try {
    // Strategy 1: Fetch markets with volume filter
    const marketsResponse = await fetch(
      `${KALSHI_API_BASE}/markets?limit=50&status=open`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      }
    );

    let allMarkets: MarketData[] = [];

    if (marketsResponse.ok) {
      const marketsData = await marketsResponse.json();
      const markets = marketsData.markets || [];
      
      // Filter for markets with reasonable titles and some activity
      const goodMarkets = markets
        .map((m: Record<string, unknown>) => normalizeMarket(m))
        .filter((m: MarketData) => {
          // Filter out sports multi-game extended markets (they have weird titles)
          if (m.ticker.includes("MULTIGAME")) return false;
          // Filter out markets with very long/concatenated titles
          if (m.title.includes(",yes ") || m.title.includes(",no ")) return false;
          // Keep markets with activity or interesting titles
          return m.status === "open" && m.title.length < 100;
        });

      allMarkets.push(...goodMarkets);
    }

    // Strategy 2: Fetch specific interesting events
    const eventPromises = FEATURED_EVENTS.map(async (eventTicker) => {
      try {
        const res = await fetch(
          `${KALSHI_API_BASE}/events/${eventTicker}`,
          {
            headers: { Accept: "application/json" },
            next: { revalidate: 60 },
          }
        );
        if (!res.ok) return null;
        const data = await res.json();
        
        // Get markets from the event
        const marketsRes = await fetch(
          `${KALSHI_API_BASE}/markets?event_ticker=${eventTicker}&limit=5`,
          {
            headers: { Accept: "application/json" },
            next: { revalidate: 60 },
          }
        );
        if (!marketsRes.ok) return null;
        const marketsData = await marketsRes.json();
        
        return (marketsData.markets || []).map((m: Record<string, unknown>) => ({
          ...normalizeMarket(m),
          // Use event title if market title is unclear
          title: m.title || data.event?.title || m.ticker,
        }));
      } catch {
        return null;
      }
    });

    const eventResults = await Promise.all(eventPromises);
    for (const markets of eventResults) {
      if (markets) {
        allMarkets.push(...markets);
      }
    }

    // Deduplicate by ticker
    const seen = new Set<string>();
    const uniqueMarkets = allMarkets.filter((m) => {
      if (seen.has(m.ticker)) return false;
      seen.add(m.ticker);
      return true;
    });

    // Sort by volume (descending), then by title length (shorter = cleaner)
    const sortedMarkets = uniqueMarkets
      .sort((a, b) => {
        const volDiff = (b.volume || 0) - (a.volume || 0);
        if (volDiff !== 0) return volDiff;
        return a.title.length - b.title.length;
      })
      .slice(0, 12);

    return NextResponse.json({ markets: sortedMarkets });
  } catch (error) {
    console.error("Error fetching trending markets:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending markets" },
      { status: 500 }
    );
  }
}

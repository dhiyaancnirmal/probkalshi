import { NextResponse } from "next/server";
import { normalizeMarket } from "@/lib/kalshi";
import type { MarketData } from "@/lib/types";

const KALSHI_API_BASE = "https://api.elections.kalshi.com/trade-api/v2";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const seriesTicker = url.searchParams.get("series_ticker");

    // Fetch events with nested markets, exclude multivariate events
    let eventsUrl = `${KALSHI_API_BASE}/events?with_nested_markets=true&limit=100&status=open`;

    // Add series filter if specified (for category selection)
    if (seriesTicker && seriesTicker !== "all") {
      eventsUrl += `&series_ticker=${encodeURIComponent(seriesTicker)}`;
    }

    const eventsResponse = await fetch(eventsUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!eventsResponse.ok) {
      throw new Error(`Kalshi API error: ${eventsResponse.status}`);
    }

    const eventsData = await eventsResponse.json();
    const events = eventsData.events || [];

    // Extract all markets from all events
    let allMarkets: MarketData[] = [];

    for (const event of events) {
      if (event.markets && Array.isArray(event.markets)) {
        // Add event's category to each market
        const marketsWithCategory = event.markets.map((m: Record<string, unknown>) => {
          const normalized = normalizeMarket(m);
          // Add event category to market data
          return {
            ...normalized,
            category: event.category || "",
          };
        });
        allMarkets.push(...marketsWithCategory);
      }
    }

    // Filter out multivariate/combo markets by checking if they have mve_collection_ticker
    // Markets with mve_collection_ticker are combo/multi-market events
    const binaryMarkets = allMarkets.filter((m) => {
      const kalshiMarket = m as unknown as { mve_collection_ticker?: string };
      return !kalshiMarket.mve_collection_ticker;
    });

    // Deduplicate by ticker
    const seen = new Set<string>();
    const uniqueMarkets = binaryMarkets.filter((m) => {
      if (seen.has(m.ticker)) return false;
      seen.add(m.ticker);
      return true;
    });

    // Sort by 24h volume (descending) for trending relevance
    const sortedMarkets = uniqueMarkets.sort((a, b) => {
      const volA = (a as any).volume_24h ?? 0;
      const volB = (b as any).volume_24h ?? 0;
      return volB - volA;
    });

    // Return top 12 markets
    return NextResponse.json({ markets: sortedMarkets.slice(0, 12) });
  } catch (error) {
    console.error("Error fetching trending markets:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending markets" },
      { status: 500 }
    );
  }
}

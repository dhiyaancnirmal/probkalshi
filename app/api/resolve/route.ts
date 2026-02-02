import { NextRequest, NextResponse } from "next/server";
import { parseKalshiUrl } from "@/lib/parse-url";
import {
  fetchKalshiMarket,
  fetchKalshiEvent,
  normalizeMarket,
} from "@/lib/kalshi";
import type { ResolveResult, MarketData } from "@/lib/types";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter", code: "INVALID_URL" },
      { status: 400 }
    );
  }

  const parsed = parseKalshiUrl(url);

  if (parsed.type === "unknown") {
    return NextResponse.json(
      { error: "Could not parse Kalshi URL", code: "INVALID_URL" },
      { status: 400 }
    );
  }

  try {
    // Try as market ticker first
    if (parsed.type === "ticker") {
      try {
        const marketResponse = await fetchKalshiMarket(parsed.value);
        const market = normalizeMarket(marketResponse.market);

        const result: ResolveResult = {
          type: "market",
          market,
        };

        return NextResponse.json(result, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "s-maxage=10, stale-while-revalidate=30",
          },
        });
      } catch {
        // If market fetch fails, try as event
      }
    }

    // Try as event ticker
    try {
      const eventResponse = await fetchKalshiEvent(parsed.value);
      const { event, markets } = eventResponse;

      // Normalize all markets in the event
      const normalizedMarkets: MarketData[] = (markets || []).map(normalizeMarket);

      // If event has exactly one market, return it as a market result
      if (normalizedMarkets.length === 1) {
        const result: ResolveResult = {
          type: "market",
          market: normalizedMarkets[0],
        };

        return NextResponse.json(result, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "s-maxage=10, stale-while-revalidate=30",
          },
        });
      }

      // Otherwise return event with all markets
      const result: ResolveResult = {
        type: "event",
        event: {
          eventTicker: event.event_ticker,
          title: event.title,
          markets: normalizedMarkets,
        },
      };

      return NextResponse.json(result, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "s-maxage=10, stale-while-revalidate=30",
        },
      });
    } catch {
      // Both market and event fetch failed
      return NextResponse.json(
        { error: "Market or event not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("429")) {
      return NextResponse.json(
        { error: "Rate limited", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to resolve URL", code: "API_ERROR" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

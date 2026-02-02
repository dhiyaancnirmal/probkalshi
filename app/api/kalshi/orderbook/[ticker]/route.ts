import { NextResponse } from "next/server";
import { fetchKalshiOrderbook, normalizeOrderbook } from "@/lib/kalshi";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  try {
    const response = await fetchKalshiOrderbook(ticker);
    const orderbook = normalizeOrderbook(response);

    return NextResponse.json(
      { orderbook },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "s-maxage=3, stale-while-revalidate=5",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("404")) {
      return NextResponse.json(
        { error: "Market not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (message.includes("429")) {
      return NextResponse.json(
        { error: "Rate limited", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch orderbook", code: "API_ERROR" },
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

import { NextResponse } from "next/server";

const KALSHI_API_BASE = "https://api.elections.kalshi.com/trade-api/v2";

export async function GET() {
  try {
    const res = await fetch(`${KALSHI_API_BASE}/series`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Kalshi API error: ${res.status}`);
    }

    const data = await res.json();

    // Map series to more readable display names
    const seriesWithNames = (data.series || []).map((s: Record<string, unknown>) => {
      const ticker = s.series_ticker as string;
      let displayName = s.title || ticker;

      // Create user-friendly names for common series
      const seriesNames: Record<string, string> = {
        "KXHIGHNY": "High Fed Funds",
        "KXHIGHNQM": "High Fed Funds",
        "KXINFLATION": "Inflation",
        "KXGDP": "GDP",
        "KXUNEMPLOYMENT": "Unemployment",
        "KXHOUSING": "Housing",
        "KXRETAILSALES": "Retail Sales",
        "KXCONSUMERSENTIMENT": "Consumer Sentiment",
        "KXGASPRICES": "Gas Prices",
        "KXOILPRICES": "Oil Prices",
        "KXELONMARS": "Space - Musk on Mars",
        "KXNEWPOPE": "New Pope",
        "KXPERSONPRESMAM": "Presidential Election",
        "KXPERSONPRESVP": "Vice Presidential Election",
        "KXPERSONPRESMAB": "Presidential Election (Before)",
        "KXPERSONPRESSOBAMA": "Press Secretary",
        "KXPERSONPRESSHARRIS": "Press Secretary",
        "KXPERSONPRESSJFK": "Press Secretary",
        "KXPERSONPRESSBIDEN": "Press Secretary",
        "KXPERSONPRESSPENCE": "Press Secretary",
        "KXPERSONPRESSRUBIO": "Press Secretary",
        "KXPERSONPRESSCLINTON": "Press Secretary",
        "KXPERSONPRESSTRUMP": "Press Secretary",
        "KXPERSONPRESSMCCONNELL": "Press Secretary",
        "KXPERSONPRESSREAGAN": "Press Secretary",
        "KXPERSONPRESSBUSH": "Press Secretary",
        "KXPERSONPRESSCARTER": "Press Secretary",
        "KXPERSONPRESSHWH": "Press Secretary",
        "KXPERSONPRESSNIXON": "Press Secretary",
        "KXPERSONPRESSFORD": "Press Secretary",
      };

      return {
        seriesTicker: ticker,
        title: s.title || displayName,
        displayName: seriesNames[ticker] || displayName,
        category: s.category || "",
      };
    });

    return NextResponse.json({ series: seriesWithNames });
  } catch (error) {
    console.error("Error fetching series list:", error);
    return NextResponse.json(
      { error: "Failed to fetch series list" },
      { status: 500 }
    );
  }
}

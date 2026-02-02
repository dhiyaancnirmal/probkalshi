import type {
  KalshiMarket,
  KalshiMarketResponse,
  KalshiEventResponse,
  KalshiOrderbookResponse,
  KalshiTradesResponse,
  MarketData,
  OrderbookData,
  TradeData,
} from "./types";

const KALSHI_BASE_URL = "https://api.elections.kalshi.com/trade-api/v2";

// ============================================
// Raw Kalshi API Fetchers
// ============================================

export async function fetchKalshiMarket(
  ticker: string
): Promise<KalshiMarketResponse> {
  const res = await fetch(`${KALSHI_BASE_URL}/markets/${ticker}`, {
    next: { revalidate: 3 },
  });

  if (!res.ok) {
    throw new Error(`Kalshi API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchKalshiEvent(
  eventTicker: string
): Promise<KalshiEventResponse> {
  const res = await fetch(`${KALSHI_BASE_URL}/events/${eventTicker}`, {
    next: { revalidate: 3 },
  });

  if (!res.ok) {
    throw new Error(`Kalshi API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchKalshiOrderbook(
  ticker: string
): Promise<KalshiOrderbookResponse> {
  const res = await fetch(`${KALSHI_BASE_URL}/markets/${ticker}/orderbook`, {
    next: { revalidate: 3 },
  });

  if (!res.ok) {
    throw new Error(`Kalshi API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchKalshiTrades(
  ticker: string,
  limit: number = 1
): Promise<KalshiTradesResponse> {
  const res = await fetch(
    `${KALSHI_BASE_URL}/trades?ticker=${ticker}&limit=${limit}`,
    {
      next: { revalidate: 3 },
    }
  );

  if (!res.ok) {
    throw new Error(`Kalshi API error: ${res.status}`);
  }

  return res.json();
}

// ============================================
// Normalizers (Kalshi → Our Types)
// ============================================

export function normalizeMarket(kalshi: KalshiMarket): MarketData {
  // Use last_price for the yes price, calculate no price as 100 - yes
  const yesPrice = kalshi.last_price ?? kalshi.yes_bid ?? 0;
  const noPrice = 100 - yesPrice;

  // Map Kalshi status to our simplified status
  // Kalshi status values: initialized, inactive, active, closed, determined, disputed, amended, finalized
  let normalizedStatus: "open" | "closed" | "settled";
  
  if (kalshi.status === "active") {
    normalizedStatus = "open";
  } else if (kalshi.status === "closed") {
    normalizedStatus = "closed";
  } else if (kalshi.status === "determined") {
    normalizedStatus = "settled";
  } else {
    // For settled markets with a result, show the result
    if (kalshi.result === "yes" || kalshi.result === "no") {
      normalizedStatus = "settled";
    } else {
      // Default to closed for other statuses
      normalizedStatus = "closed";
    }
  }

  return {
    ticker: kalshi.ticker,
    title: kalshi.title,
    subtitle: kalshi.subtitle || "",
    yesPrice,
    noPrice,
    volume: kalshi.volume,
    openInterest: kalshi.open_interest,
    status: normalizedStatus,
    result: kalshi.result,
    eventTicker: kalshi.event_ticker,
    closeTime: kalshi.close_time,
    category: kalshi.category || "",
    imageUrl: kalshi.image_url || "",
    isProvisional: kalshi.is_provisional || false,
  };
}

export function normalizeOrderbook(
  kalshi: KalshiOrderbookResponse
): OrderbookData {
  const { yes, no } = kalshi.orderbook;

  // Best YES bid is highest price in yes array (last element if sorted ascending)
  // Kalshi returns bids sorted ascending, so last = highest
  const bestYesBid = yes.length > 0 ? yes[yes.length - 1][0] : null;
  const bestNoBid = no.length > 0 ? no[no.length - 1][0] : null;

  // Implied YES ask = 100 - best NO bid
  const impliedYesAsk = bestNoBid !== null ? 100 - bestNoBid : null;

  // Spread = implied YES ask - best YES bid
  const spread =
    impliedYesAsk !== null && bestYesBid !== null
      ? impliedYesAsk - bestYesBid
      : null;

  // Depth = total quantity available
  const yesDepth = yes.reduce((sum, [, qty]) => sum + qty, 0);
  const noDepth = no.reduce((sum, [, qty]) => sum + qty, 0);

  return {
    bestYesBid,
    bestNoBid,
    impliedYesAsk,
    spread,
    yesDepth,
    noDepth,
  };
}

export function normalizeTrade(kalshi: KalshiTradesResponse): TradeData | null {
  if (kalshi.trades.length === 0) return null;

  const trade = kalshi.trades[0];
  return {
    ticker: trade.ticker,
    yesPrice: trade.yes_price,
    noPrice: trade.no_price,
    count: trade.count,
    takerSide: trade.taker_side,
    createdTime: trade.created_time,
  };
}

// ============================================
// High-Level Fetchers (Normalized)
// ============================================

export async function getMarket(ticker: string): Promise<MarketData> {
  const response = await fetchKalshiMarket(ticker);
  return normalizeMarket(response.market);
}

export async function getOrderbook(ticker: string): Promise<OrderbookData> {
  const response = await fetchKalshiOrderbook(ticker);
  return normalizeOrderbook(response);
}

export async function getLastTrade(ticker: string): Promise<TradeData | null> {
  const response = await fetchKalshiTrades(ticker, 1);
  return normalizeTrade(response);
}

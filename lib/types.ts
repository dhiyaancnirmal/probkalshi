// ============================================
// Kalshi API Response Types
// ============================================

export interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle: string;
  yes_bid: number; // cents (0-99)
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  volume: number;
  open_interest: number;
  status: "open" | "closed" | "settled" | "active";
  result: "" | "yes" | "no";
  event_ticker: string;
  close_time: string;
  category?: string;
  image_url?: string;
}

export interface KalshiMarketResponse {
  market: KalshiMarket;
}

export interface KalshiEvent {
  event_ticker: string;
  title: string;
  sub_title?: string;
  category: string;
  series_ticker?: string;
}

export interface KalshiEventResponse {
  event: KalshiEvent;
  markets: KalshiMarket[]; // markets is at root level, not inside event
}

export interface KalshiOrderbook {
  yes: [number, number][]; // [price_cents, quantity]
  no: [number, number][];
}

export interface KalshiOrderbookResponse {
  orderbook: KalshiOrderbook;
}

export interface KalshiTrade {
  ticker: string;
  yes_price: number;
  no_price: number;
  count: number;
  taker_side: "yes" | "no";
  created_time: string;
}

export interface KalshiTradesResponse {
  trades: KalshiTrade[];
}

// ============================================
// Normalized Types (for our app)
// ============================================

export interface MarketData {
  ticker: string;
  title: string;
  subtitle: string;
  yesPrice: number; // cents (0-99)
  noPrice: number;
  volume: number;
  openInterest: number;
  status: "open" | "closed" | "settled";
  result: "" | "yes" | "no";
  eventTicker: string;
  closeTime: string;
  category: string;
  imageUrl: string;
}

export interface OrderbookData {
  bestYesBid: number | null;
  bestNoBid: number | null;
  impliedYesAsk: number | null;
  spread: number | null;
  yesDepth: number;
  noDepth: number;
}

export interface TradeData {
  ticker: string;
  yesPrice: number;
  noPrice: number;
  count: number;
  takerSide: "yes" | "no";
  createdTime: string;
}

export interface CombinedMarketData {
  market: MarketData;
  orderbook: OrderbookData | null;
  lastTrade: TradeData | null;
  fetchedAt: number;
}

// ============================================
// Overlay Configuration Types
// ============================================

export type OverlayPreset = "big-card" | "compact-ticker" | "side-panel";
export type OverlayTheme = "dark" | "light" | "transparent";

export interface OverlayConfig {
  ticker: string;
  preset: OverlayPreset;
  theme: OverlayTheme;
  showTrade: boolean;
  showButton: boolean;
  accent: string; // hex without #
}

export const DEFAULT_OVERLAY_CONFIG: Omit<OverlayConfig, "ticker"> = {
  preset: "big-card",
  theme: "transparent",
  showTrade: true,
  showButton: false,
  accent: "09C285", // Kalshi brand green
};

// ============================================
// API Error Types
// ============================================

export interface ApiError {
  error: string;
  code: "NOT_FOUND" | "RATE_LIMITED" | "API_ERROR" | "INVALID_URL";
}

// ============================================
// URL Resolution Types
// ============================================

export interface ResolveResult {
  type: "market" | "event";
  market?: MarketData;
  event?: {
    eventTicker: string;
    title: string;
    markets: MarketData[];
  };
}

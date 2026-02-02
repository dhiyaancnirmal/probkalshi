/**
 * Parse Kalshi URLs and extract ticker/event information
 *
 * Kalshi URLs come in several forms:
 * - https://kalshi.com/markets/kxfedcut                     → series page
 * - https://kalshi.com/markets/kxfedcut/kxfedcut-26jan       → event page
 * - https://kalshi.com/markets/KXFEDCUT-26JAN-T0.5           → direct market ticker
 * - Raw ticker: KXFEDCUT-26JAN-T0.5
 */

export interface ParsedUrl {
  type: "ticker" | "event" | "series" | "unknown";
  value: string;
  original: string;
}

export function parseKalshiUrl(input: string): ParsedUrl {
  const trimmed = input.trim();

  // If it's a raw ticker (no slashes, looks like a ticker pattern)
  // Tickers are uppercase with hyphens and sometimes dots, e.g., KXFEDCUT-26JAN-T0.5
  if (!trimmed.includes("/") && /^[A-Z0-9][\w.-]*$/i.test(trimmed)) {
    return {
      type: isLikelyMarketTicker(trimmed) ? "ticker" : "event",
      value: trimmed.toUpperCase(),
      original: trimmed,
    };
  }

  // Try to parse as URL
  let url: URL;
  try {
    // Handle URLs without protocol
    const urlString = trimmed.startsWith("http")
      ? trimmed
      : `https://${trimmed}`;
    url = new URL(urlString);
  } catch {
    return { type: "unknown", value: "", original: trimmed };
  }

  // Check if it's a Kalshi URL
  if (!url.hostname.includes("kalshi.com")) {
    return { type: "unknown", value: "", original: trimmed };
  }

  // Extract path segments after /markets/
  const path = url.pathname;
  const marketsMatch = path.match(/\/markets\/(.+)/i);

  if (!marketsMatch) {
    return { type: "unknown", value: "", original: trimmed };
  }

  const afterMarkets = marketsMatch[1];
  const segments = afterMarkets.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { type: "unknown", value: "", original: trimmed };
  }

  // If there's only one segment, determine if it's a ticker or event
  if (segments.length === 1) {
    const value = segments[0].toUpperCase();
    return {
      type: isLikelyMarketTicker(value) ? "ticker" : "event",
      value,
      original: trimmed,
    };
  }

  // Two segments: /markets/series/event or /markets/series/ticker
  // The second segment is what we want
  const secondSegment = segments[1].toUpperCase();
  return {
    type: isLikelyMarketTicker(secondSegment) ? "ticker" : "event",
    value: secondSegment,
    original: trimmed,
  };
}

/**
 * Determine if a string looks like a market ticker vs an event ticker
 *
 * Market tickers typically have more segments with specific strike info:
 * - KXFEDCUT-26JAN-T0.5 (market - has strike)
 * - KXFEDCUT-26JAN (event - no strike)
 *
 * This is a heuristic - we'll verify against the API
 */
function isLikelyMarketTicker(value: string): boolean {
  // Market tickers usually have 3+ hyphen-separated parts
  // or contain specific patterns like -T (for strike), -F, -B (yes/no bracket)
  const parts = value.split("-");

  // If it has 3+ parts, likely a market ticker
  if (parts.length >= 3) {
    return true;
  }

  // Check for common market ticker patterns
  if (/-(T|F|B|Y|N)\d*\.?\d*$/i.test(value)) {
    return true;
  }

  // Default to event (will be verified by API)
  return false;
}

/**
 * Build a Kalshi market URL from a ticker
 */
export function buildKalshiUrl(ticker: string): string {
  return `https://kalshi.com/markets/${ticker}`;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================
// Tailwind Utilities
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Price Formatting
// ============================================

/**
 * Format price in cents to display format
 * @param cents - Price in cents (0-99)
 * @returns Formatted string like "63¢"
 */
export function formatPrice(cents: number | null): string {
  if (cents === null) return "—";
  return `${cents}¢`;
}

/**
 * Format price as probability percentage
 * @param cents - Price in cents (0-99)
 * @returns Formatted string like "63%"
 */
export function formatProbability(cents: number | null): string {
  if (cents === null) return "—";
  return `${cents}%`;
}

/**
 * Format delta (price change) with arrow
 * @param delta - Change in percentage points (can be negative)
 * @returns Formatted string like "▲ +2%" or "▼ -3%"
 */
export function formatDelta(delta: number | null): string {
  if (delta === null || delta === 0) return "";
  const arrow = delta > 0 ? "▲" : "▼";
  const sign = delta > 0 ? "+" : "";
  return `${arrow} ${sign}${delta}%`;
}

/**
 * Get CSS class for delta color (Kalshi brand colors)
 * Increase: #0AC285 (Kalshi green)
 * Decrease: #D91616 (Kalshi red)
 */
export function getDeltaColor(delta: number | null): string {
  if (delta === null || delta === 0) return "text-gray-400";
  return delta > 0 ? "text-[#0AC285]" : "text-[#D91616]";
}

// ============================================
// Number Formatting
// ============================================

/**
 * Format large numbers with K/M suffixes
 * @param num - Number to format
 * @returns Formatted string like "1.2K" or "3.4M"
 */
export function formatCompact(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format volume for display
 */
export function formatVolume(volume: number): string {
  return `$${formatCompact(volume)}`;
}

// ============================================
// Time Formatting
// ============================================

/**
 * Format time as relative (e.g., "3s ago", "5m ago")
 * @param isoString - ISO timestamp
 * @returns Relative time string
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

/**
 * Format close time for display
 */
export function formatCloseTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ============================================
// URL Building
// ============================================

/**
 * Build overlay URL with config params
 */
export function buildOverlayUrl(
  baseUrl: string,
  config: {
    ticker: string;
    preset?: string;
    theme?: string;
    showTrade?: boolean;
    showButton?: boolean;
    accent?: string;
  }
): string {
  const url = new URL("/overlay", baseUrl);

  url.searchParams.set("ticker", config.ticker);

  if (config.preset && config.preset !== "big-card") {
    url.searchParams.set("preset", config.preset);
  }
  if (config.theme && config.theme !== "transparent") {
    url.searchParams.set("theme", config.theme);
  }
  if (config.showTrade === false) {
    url.searchParams.set("showTrade", "false");
  }
  if (config.showButton === true) {
    url.searchParams.set("showButton", "true");
  }
  if (config.accent && config.accent !== "09C285") {
    url.searchParams.set("accent", config.accent);
  }

  return url.toString();
}

// ============================================
// Validation
// ============================================

/**
 * Check if a hex color is valid (without #)
 */
export function isValidHexColor(hex: string): boolean {
  return /^[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

"use client";

import type { TradeData } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LastTradeProps {
  trade: TradeData | null;
  className?: string;
}

export function LastTrade({ trade, className }: LastTradeProps) {
  if (!trade) {
    return null;
  }

  const sideColor = trade.takerSide === "yes" ? "text-green-400" : "text-red-400";

  return (
    <div className={cn("text-xs text-gray-400", className)}>
      <span>Last: </span>
      <span className="text-gray-300">{trade.yesPrice}¢</span>
      <span className="mx-1">×</span>
      <span className="text-gray-300">{trade.count}</span>
      <span className={cn("ml-1 uppercase", sideColor)}>{trade.takerSide}</span>
      <span className="mx-1">·</span>
      <span>{formatRelativeTime(trade.createdTime)}</span>
    </div>
  );
}

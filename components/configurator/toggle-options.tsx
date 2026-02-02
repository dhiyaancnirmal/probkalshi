"use client";

import { cn } from "@/lib/utils";

interface ToggleOptionsProps {
  showTrade: boolean;
  showButton: boolean;
  onShowTradeChange: (value: boolean) => void;
  onShowButtonChange: (value: boolean) => void;
  className?: string;
}

export function ToggleOptions({
  showTrade,
  showButton,
  onShowTradeChange,
  onShowButtonChange,
  className,
}: ToggleOptionsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="block text-sm font-medium text-gray-400">Options</label>

      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showTrade}
            onChange={(e) => onShowTradeChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
          />
          <span className="text-sm text-gray-300">Show last trade info</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showButton}
            onChange={(e) => onShowButtonChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
          />
          <span className="text-sm text-gray-300">Show trade button</span>
        </label>
      </div>
    </div>
  );
}

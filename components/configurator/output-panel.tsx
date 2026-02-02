"use client";

import { useState, useCallback } from "react";
import { cn, buildOverlayUrl } from "@/lib/utils";
import type { OverlayConfig } from "@/lib/types";

interface OutputPanelProps {
  config: OverlayConfig;
  className?: string;
}

const OBS_INSTRUCTIONS = `1. Open OBS → Sources → + → Browser
2. Name: "Kalshi Odds"
3. URL: [OVERLAY_URL]
4. Width: 420  Height: 240  (adjust per preset)
5. ✓ Shutdown source when not visible
6. ✓ Refresh browser when scene becomes active
7. Done — odds update live automatically!`;

export function OutputPanel({ config, className }: OutputPanelProps) {
  const [copied, setCopied] = useState<"url" | "obs" | null>(null);

  const overlayUrl = buildOverlayUrl(
    typeof window !== "undefined" ? window.location.origin : "https://probkalshi.com",
    config
  );

  const handleCopy = useCallback(
    async (type: "url" | "obs") => {
      const textToCopy =
        type === "url"
          ? overlayUrl
          : OBS_INSTRUCTIONS.replace("[OVERLAY_URL]", overlayUrl);

      await navigator.clipboard.writeText(textToCopy);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    },
    [overlayUrl]
  );

  return (
    <div className={cn("space-y-4", className)}>
      <label className="block text-sm font-medium text-gray-400">
        Your Overlay URL
      </label>

      {/* URL Display */}
      <div className="relative">
        <input
          type="text"
          value={overlayUrl}
          readOnly
          className={cn(
            "w-full px-4 py-3 pr-24 rounded-lg",
            "bg-gray-800 border border-gray-700",
            "text-gray-300 text-sm font-mono",
            "focus:outline-none"
          )}
        />
        <button
          onClick={() => handleCopy("url")}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "px-3 py-1.5 rounded text-sm font-medium",
            "bg-gray-700 hover:bg-gray-600 text-white",
            "transition-colors"
          )}
        >
          {copied === "url" ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleCopy("obs")}
          className={cn(
            "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium",
            "bg-gray-800 border border-gray-700",
            "text-gray-300 hover:border-gray-600",
            "transition-colors flex items-center justify-center gap-2"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          {copied === "obs" ? "Copied!" : "Copy OBS Setup"}
        </button>

        <a
          href={overlayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium",
            "bg-[#09C285] text-black",
            "hover:bg-[#0AD990] transition-colors",
            "flex items-center justify-center gap-2"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Preview
        </a>
      </div>
    </div>
  );
}

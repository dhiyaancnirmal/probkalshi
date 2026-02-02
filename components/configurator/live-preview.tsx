"use client";

import { cn } from "@/lib/utils";
import type { OverlayConfig } from "@/lib/types";

interface LivePreviewProps {
  config: OverlayConfig;
  className?: string;
}

export function LivePreview({ config, className }: LivePreviewProps) {
  const { ticker, preset, theme, showTrade, showButton, accent } = config;

  // Build the preview URL with all params
  const params = new URLSearchParams();
  params.set("ticker", ticker);
  if (preset !== "big-card") params.set("preset", preset);
  if (theme !== "transparent") params.set("theme", theme);
  if (!showTrade) params.set("showTrade", "false");
  if (showButton) params.set("showButton", "true");
  if (accent !== "09C285") params.set("accent", accent);

  const previewUrl = `/overlay?${params.toString()}`;

  // Dimensions based on preset
  const dimensions = {
    "big-card": { width: 440, height: 280 },
    "compact-ticker": { width: 600, height: 80 },
    "side-panel": { width: 180, height: 320 },
  };

  const { width, height } = dimensions[preset];

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-400">
        Live Preview
      </label>

      <div
        className={cn(
          "rounded-lg overflow-hidden border border-gray-700",
          "bg-[url('/preview-bg.png')] bg-repeat bg-center"
        )}
        style={{
          // Checkerboard pattern for transparent preview
          backgroundImage:
            "linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          backgroundColor: "#2a2a2a",
        }}
      >
        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <iframe
            src={previewUrl}
            width={width}
            height={height}
            className="border-0 rounded-lg"
            style={{
              transform: "scale(0.85)",
              transformOrigin: "center center",
            }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Preview updates in real-time as you change settings
      </p>
    </div>
  );
}

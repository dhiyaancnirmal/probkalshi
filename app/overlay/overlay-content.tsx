"use client";

import { useSearchParams } from "next/navigation";
import { OverlayShell } from "@/components/overlay";
import type { OverlayConfig, OverlayPreset, OverlayTheme } from "@/lib/types";
import { DEFAULT_OVERLAY_CONFIG } from "@/lib/types";

export function OverlayContent() {
  const searchParams = useSearchParams();

  const ticker = searchParams.get("ticker");
  const preset = (searchParams.get("preset") as OverlayPreset) || DEFAULT_OVERLAY_CONFIG.preset;
  const theme = (searchParams.get("theme") as OverlayTheme) || DEFAULT_OVERLAY_CONFIG.theme;
  const showTrade = searchParams.get("showTrade") !== "false";
  const showButton = searchParams.get("showButton") === "true";
  const accent = searchParams.get("accent") || DEFAULT_OVERLAY_CONFIG.accent;

  if (!ticker) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-gray-400">
          <p className="text-lg mb-2">No ticker specified</p>
          <p className="text-sm">
            Add <code className="bg-gray-800 px-1 rounded">?ticker=TICKER</code> to the URL
          </p>
        </div>
      </div>
    );
  }

  const config: OverlayConfig = {
    ticker,
    preset,
    theme,
    showTrade,
    showButton,
    accent,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <OverlayShell config={config} />
    </div>
  );
}

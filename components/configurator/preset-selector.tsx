"use client";

import { cn } from "@/lib/utils";
import type { OverlayPreset } from "@/lib/types";

interface PresetSelectorProps {
  value: OverlayPreset;
  onChange: (preset: OverlayPreset) => void;
  className?: string;
}

const presets: { value: OverlayPreset; label: string; description: string }[] = [
  {
    value: "big-card",
    label: "Big Card",
    description: "Full overlay for watch parties",
  },
  {
    value: "compact-ticker",
    label: "Compact Ticker",
    description: "Single line for news crawl",
  },
  {
    value: "side-panel",
    label: "Side Panel",
    description: "Vertical sidebar overlay",
  },
];

export function PresetSelector({ value, onChange, className }: PresetSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-400">
        Layout Preset
      </label>
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={cn(
              "p-3 rounded-lg border text-left transition-all",
              value === preset.value
                ? "border-[#09C285] bg-[#09C285]/10"
                : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
            )}
          >
            <div className="text-sm font-medium text-white">{preset.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

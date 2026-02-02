"use client";

import { cn } from "@/lib/utils";
import type { OverlayTheme } from "@/lib/types";

interface ThemePickerProps {
  value: OverlayTheme;
  onChange: (theme: OverlayTheme) => void;
  className?: string;
}

const themes: { value: OverlayTheme; label: string }[] = [
  { value: "transparent", label: "Transparent" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export function ThemePicker({ value, onChange, className }: ThemePickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-400">Theme</label>
      <div className="flex gap-2">
        {themes.map((theme) => (
          <button
            key={theme.value}
            type="button"
            onClick={() => onChange(theme.value)}
            className={cn(
              "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
              value === theme.value
                ? "border-[#09C285] bg-[#09C285]/10 text-white"
                : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
            )}
          >
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  );
}

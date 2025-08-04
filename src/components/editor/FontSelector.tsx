"use client";

import { fontOptions, getFontFamilyValue } from "@/lib/fonts";
import type { FontFamily } from "@/lib/templates/types";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

interface FontSelectorProps {
  value: FontFamily;
  onChange: (value: FontFamily) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {

  // Group fonts by category
  const categories = ["Sans-serif", "Serif", "Monospace"] as const;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FontFamily)}
        className={clsx(
          "w-full appearance-none rounded border border-slate-200 bg-white",
          "px-3 py-2 pr-8 text-sm text-slate-700",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
          "cursor-pointer transition-colors hover:border-slate-300"
        )}
        style={{ fontFamily: getFontFamilyValue(value) }}
      >
        {categories.map((category) => (
          <optgroup key={category} label={category}>
            {fontOptions
              .filter((font) => font.category === category)
              .map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: getFontFamilyValue(font.value) }}
                >
                  {font.label}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

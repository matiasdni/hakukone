/**
 * Font Configuration for Resume Templates
 *
 * Uses next/font for optimized font loading.
 * Exports CSS variables that can be applied to the HTML element.
 */

import {
  Inter,
  Merriweather,
  JetBrains_Mono,
  Lora,
  Source_Sans_3,
} from "next/font/google";

// Sans-serif font (default)
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Alternative sans-serif
export const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});

// Serif font
export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  variable: "--font-serif",
});

// Alternative serif
export const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-lora",
});

// Monospace font
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// Combined class string for all font variables
export const fontVariables = [
  inter.variable,
  sourceSans.variable,
  merriweather.variable,
  lora.variable,
  jetbrainsMono.variable,
].join(" ");

// Map font family names to CSS variable values
export const fontFamilyMap = {
  inter: "var(--font-sans), system-ui, sans-serif",
  "source-sans": "var(--font-source-sans), system-ui, sans-serif",
  merriweather: "var(--font-serif), Georgia, serif",
  lora: "var(--font-lora), Georgia, serif",
  "jetbrains-mono": "var(--font-mono), ui-monospace, monospace",
} as const;

export type FontFamilyKey = keyof typeof fontFamilyMap;

// Font options for UI selection dropdown, grouped by category
export const fontOptions = [
  { value: "inter" as const, label: "Inter", category: "Sans-serif" },
  {
    value: "source-sans" as const,
    label: "Source Sans 3",
    category: "Sans-serif",
  },
  { value: "merriweather" as const, label: "Merriweather", category: "Serif" },
  { value: "lora" as const, label: "Lora", category: "Serif" },
  {
    value: "jetbrains-mono" as const,
    label: "JetBrains Mono",
    category: "Monospace",
  },
] as const;

// Get font family CSS value from font key
export function getFontFamilyValue(fontKey: FontFamilyKey): string {
  return fontFamilyMap[fontKey] || fontFamilyMap.inter;
}

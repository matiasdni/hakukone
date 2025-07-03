import type { FontFamily, TypographyStyle } from "../../types";

// ==================== UTILITY FUNCTIONS ====================

export const getFontFamily = (family: FontFamily): string => {
  switch (family) {
    case "merriweather":
    case "lora":
      return "Times-Roman";
    case "jetbrains-mono":
      return "Courier";
    case "inter":
    case "source-sans":
    default:
      return "Helvetica";
  }
};

export const getFontWeight = (weight?: string): "bold" | "normal" => {
  return weight === "bold" || weight === "semibold" ? "bold" : "normal";
};

// Returns a plain object with the PDF text styles
export const typographyToPDFStyle = (
  style: TypographyStyle,
  baseFontFamily: FontFamily
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  return {
    fontFamily: getFontFamily(style.fontFamily || baseFontFamily),
    fontSize: style.fontSize,
    fontWeight: getFontWeight(style.fontWeight),
    color: style.color,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textAlign: style.textAlign,
    textTransform: style.textTransform,
  };
};

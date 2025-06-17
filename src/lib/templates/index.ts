/**
 * Template Engine
 *
 * A comprehensive template system for rendering resumes in both HTML and PDF.
 * Provides:
 * - Type-safe template definitions
 * - Built-in templates (Modern, Minimal, Creative, Executive)
 * - Template resolution with user overrides
 * - Unified rendering for HTML (React) and PDF (@react-pdf/renderer)
 */

// Re-export types
export * from "./types";

// Re-export template registry and definitions
export {
    creativeTemplate,
    executiveTemplate, minimalTemplate, modernTemplate, templateRegistry
} from "./definitions";

// Template Resolution Utilities
import { templateRegistry } from "./definitions";
import type {
    ColorConfig,
    ResolvedTemplate,
    TemplateOverrides,
    TypographyStyle,
} from "./types";

/**
 * Deep merge two objects, with source values overriding target values
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== undefined &&
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetValue as object,
        sourceValue as object
      );
    } else if (sourceValue !== undefined) {
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Resolve a template with user overrides applied
 */
export function resolveTemplate(
  templateId: string,
  overrides?: TemplateOverrides
): ResolvedTemplate {
  const baseTemplate =
    templateRegistry.get(templateId) || templateRegistry.getDefault();

  if (!overrides) {
    return {
      ...baseTemplate,
      photo: baseTemplate.photo,
    };
  }

  // Apply overrides using deepMerge for full flexibility
  const resolved: ResolvedTemplate = {
    ...baseTemplate,

    // Layout: full deep merge
    layout: overrides.layout
      ? deepMerge(baseTemplate.layout, overrides.layout)
      : baseTemplate.layout,

    // Typography: full deep merge of all typography styles
    typography: overrides.typography
      ? deepMerge(baseTemplate.typography, overrides.typography)
      : baseTemplate.typography,

    // Colors: full deep merge
    colors: overrides.colors
      ? deepMerge(baseTemplate.colors, overrides.colors)
      : baseTemplate.colors,

    // Header: full deep merge
    header: overrides.header
      ? deepMerge(baseTemplate.header, overrides.header)
      : baseTemplate.header,

    // Photo: full deep merge
    photo: overrides.photo
      ? deepMerge(baseTemplate.photo, overrides.photo)
      : baseTemplate.photo,

    // Sections: full deep merge
    sections: overrides.sections
      ? deepMerge(baseTemplate.sections, overrides.sections)
      : baseTemplate.sections,

    // Skills: full deep merge
    skills: overrides.skills
      ? deepMerge(baseTemplate.skills, overrides.skills)
      : baseTemplate.skills,

    // Languages: full deep merge
    languages: overrides.languages
      ? deepMerge(baseTemplate.languages, overrides.languages)
      : baseTemplate.languages,

    // Section visibility (ordered array, not merged)
    sectionVisibility: overrides.sectionVisibility,
  };

  return resolved;
}

/**
 * Convert typography style to CSS properties
 */
export function typographyToCSS(style: TypographyStyle): React.CSSProperties {
  const css: React.CSSProperties = {
    fontSize: `${style.fontSize}px`,
  };

  if (style.fontWeight) {
    const weights: Record<string, number> = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    };
    css.fontWeight = weights[style.fontWeight] || 400;
  }

  if (style.color) css.color = style.color;
  if (style.lineHeight) css.lineHeight = style.lineHeight;
  if (style.letterSpacing) css.letterSpacing = `${style.letterSpacing}px`;
  if (style.textAlign) css.textAlign = style.textAlign;
  if (style.textTransform) css.textTransform = style.textTransform;

  return css;
}

/**
 * Convert typography style to Tailwind-compatible classes
 */
export function typographyToClasses(style: TypographyStyle): string {
  const classes: string[] = [];

  // Font weight
  if (style.fontWeight) {
    const weightMap: Record<string, string> = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    };
    classes.push(weightMap[style.fontWeight] || "font-normal");
  }

  // Text transform
  if (style.textTransform) {
    const transformMap: Record<string, string> = {
      uppercase: "uppercase",
      lowercase: "lowercase",
      capitalize: "capitalize",
      none: "normal-case",
    };
    classes.push(transformMap[style.textTransform] || "");
  }

  // Text align
  if (style.textAlign) {
    const alignMap: Record<string, string> = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    };
    classes.push(alignMap[style.textAlign] || "");
  }

  return classes.filter(Boolean).join(" ");
}

/**
 * Get font family CSS class
 */
export function getFontFamilyClass(family: string): string {
  switch (family) {
    case "merriweather":
    case "lora":
      return "font-serif";
    case "jetbrains-mono":
      return "font-mono";
    case "inter":
    case "source-sans":
    default:
      return "font-sans";
  }
}

/**
 * Convert colors to CSS custom properties
 */
export function colorsToCustomProperties(
  colors: ColorConfig
): Record<string, string> {
  return {
    "--color-primary": colors.primary,
    "--color-secondary": colors.secondary || colors.primary,
    "--color-background": colors.background,
    "--color-sidebar-bg": colors.sidebarBackground || colors.background,
    "--color-text": colors.text,
    "--color-sidebar-text": colors.sidebarText || colors.text,
    "--color-muted": colors.mutedText,
    "--color-border": colors.border,
    "--color-skill-tag-bg": colors.skillTagBackground || colors.border,
    "--color-skill-tag-text": colors.skillTagText || colors.text,
  };
}

/**
 * Check if a section should be in the sidebar
 */
export function isSidebarSection(
  sectionType: string,
  template: ResolvedTemplate
): boolean {
  if (template.layout.type !== "two-column-sidebar") {
    return false;
  }
  return template.layout.sidebarSections?.includes(sectionType) ?? false;
}

/**
 * Get container styles based on layout
 */
export function getContainerStyles(
  template: ResolvedTemplate
): React.CSSProperties {
  const { pagePadding } = template.layout;

  if (template.layout.type === "two-column-sidebar") {
    return {}; // Sidebar layout handles its own padding
  }

  return {
    paddingTop: pagePadding.top,
    paddingRight: pagePadding.right,
    paddingBottom: pagePadding.bottom,
    paddingLeft: pagePadding.left,
  };
}

/**
 * Get section gap style
 */
export function getSectionGapStyle(
  template: ResolvedTemplate
): React.CSSProperties {
  return {
    marginBottom: template.layout.sectionGap,
  };
}

/**
 * Get item gap style
 */
export function getItemGapStyle(
  template: ResolvedTemplate
): React.CSSProperties {
  return {
    marginBottom: template.layout.itemGap,
  };
}

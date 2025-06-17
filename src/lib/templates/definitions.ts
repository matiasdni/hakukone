/**
 * Built-in Template Definitions
 *
 * These templates are shipped with the app and serve as:
 * - Ready-to-use professional templates
 * - Starting points for user customization
 */

import type { TemplateDefinition } from "./types";

// ==================== MODERN TEMPLATE ====================
export const modernTemplate: TemplateDefinition = {
  id: "modern",
  name: "Modern",
  description:
    "Clean and professional with a left-aligned header and blue accents",
  tags: ["Professional", "Clean", "Corporate"],
  isBuiltIn: true,
  isCustomizable: true,

  layout: {
    type: "single-column",
    pagePadding: { top: 40, right: 40, bottom: 40, left: 40 },
    sectionGap: 24,
    itemGap: 16,
  },

  typography: {
    baseFontFamily: "inter",
    name: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#0f172a",
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 16,
      fontWeight: "medium",
      // Color uses primary accent
    },
    sectionHeading: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    itemTitle: {
      fontSize: 13,
      fontWeight: "bold",
      color: "#0f172a",
    },
    itemSubtitle: {
      fontSize: 11,
      fontWeight: "medium",
      // Color uses primary accent
    },
    date: {
      fontSize: 9,
      color: "#64748b",
      fontWeight: "medium",
    },
    body: {
      fontSize: 10,
      color: "#475569",
      lineHeight: 1.5,
    },
    contact: {
      fontSize: 10,
      color: "#64748b",
      fontWeight: "medium",
    },
    skillTag: {
      fontSize: 9,
      color: "#475569",
      fontWeight: "medium",
    },
  },

  colors: {
    primary: "#2563eb",
    background: "#ffffff",
    text: "#1e293b",
    mutedText: "#64748b",
    border: "#e2e8f0",
    skillTagBackground: "#f1f5f9",
    skillTagText: "#475569",
  },

  header: {
    layout: "left",
    showPhoto: true,
    photoSize: 80,
    photoShape: "circle",
    showContactIcons: true,
    contactLayout: "inline",
    showDivider: true,
    marginBottom: 24,
  },

  photo: {
    show: true,
    size: 80,
    shape: "circle",
    borderWidth: 4,
    borderColor: "#f8fafc",
  },

  sections: {
    headingStyle: "underlined",
    showItemDividers: false,
    itemHeaderLayout: "inline",
  },

  skills: {
    display: "tags",
    tagShape: "pill",
  },

  languages: {
    display: "grid",
    showLevel: true,
    levelStyle: "text",
  },
};

// ==================== MINIMAL TEMPLATE ====================
export const minimalTemplate: TemplateDefinition = {
  id: "minimal",
  name: "Minimal",
  description: "Simple black and white centered design focused on content",
  tags: ["Simple", "Elegant", "Minimalist"],
  isBuiltIn: true,
  isCustomizable: true,

  layout: {
    type: "single-column",
    pagePadding: { top: 50, right: 50, bottom: 50, left: 50 },
    sectionGap: 24,
    itemGap: 16,
  },

  typography: {
    baseFontFamily: "merriweather",
    name: {
      fontSize: 28,
      fontWeight: "normal",
      color: "#000000",
      textTransform: "uppercase",
      letterSpacing: 3,
      textAlign: "center",
    },
    title: {
      fontSize: 11,
      fontWeight: "medium",
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: 2,
      textAlign: "center",
    },
    sectionHeading: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#000000",
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    itemTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#000000",
    },
    itemSubtitle: {
      fontSize: 11,
      fontWeight: "normal",
      color: "#4b5563",
    },
    date: {
      fontSize: 10,
      color: "#6b7280",
    },
    body: {
      fontSize: 10,
      color: "#374151",
      lineHeight: 1.5,
      textAlign: "justify",
    },
    contact: {
      fontSize: 10,
      color: "#4b5563",
      textAlign: "center",
    },
    skillTag: {
      fontSize: 10,
      color: "#374151",
    },
  },

  colors: {
    primary: "#000000",
    background: "#ffffff",
    text: "#000000",
    mutedText: "#6b7280",
    border: "#000000",
    skillTagBackground: "transparent",
    skillTagText: "#374151",
  },

  header: {
    layout: "center",
    showPhoto: true,
    photoSize: 70,
    photoShape: "circle",
    showContactIcons: false,
    contactLayout: "inline",
    showDivider: false,
    marginBottom: 32,
  },

  photo: {
    show: true,
    size: 70,
    shape: "circle",
    borderWidth: 0,
    grayscale: true,
  },

  sections: {
    headingStyle: "underlined",
    showItemDividers: false,
    itemHeaderLayout: "inline",
  },

  skills: {
    display: "inline",
    separator: " • ",
  },

  languages: {
    display: "inline",
    showLevel: true,
    levelStyle: "text",
  },
};

// ==================== CREATIVE TEMPLATE ====================
export const creativeTemplate: TemplateDefinition = {
  id: "creative",
  name: "Creative",
  description: "Two-column layout with a dark sidebar for standout appeal",
  tags: ["Creative", "Bold", "Two-Column"],
  isBuiltIn: true,
  isCustomizable: true,

  layout: {
    type: "two-column-sidebar",
    sidebarWidth: "35%",
    sidebarPosition: "left",
    sidebarSections: ["summary", "skills", "certifications", "languages"],
    pagePadding: { top: 0, right: 0, bottom: 0, left: 0 },
    sectionGap: 20,
    itemGap: 14,
  },

  typography: {
    baseFontFamily: "source-sans",
    name: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#ffffff",
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 13,
      fontWeight: "medium",
      color: "#c4b5fd", // Purple tint
    },
    sectionHeading: {
      fontSize: 9,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      // Color varies by location (sidebar vs main)
    },
    itemTitle: {
      fontSize: 13,
      fontWeight: "bold",
      color: "#0f172a",
    },
    itemSubtitle: {
      fontSize: 11,
      fontWeight: "medium",
    },
    date: {
      fontSize: 8,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    body: {
      fontSize: 10,
      color: "#64748b",
      lineHeight: 1.5,
    },
    contact: {
      fontSize: 9,
      color: "#cbd5e1",
    },
    skillTag: {
      fontSize: 8,
      color: "#ffffff",
    },
  },

  colors: {
    primary: "#8b5cf6",
    secondary: "#c4b5fd",
    background: "#ffffff",
    sidebarBackground: "#0f172a",
    text: "#1e293b",
    sidebarText: "#ffffff",
    mutedText: "#64748b",
    border: "#f1f5f9",
    skillTagBackground: "rgba(255,255,255,0.1)",
    skillTagText: "#ffffff",
  },

  header: {
    layout: "left",
    showPhoto: true,
    photoSize: 80,
    photoShape: "circle",
    showContactIcons: true,
    contactLayout: "stacked",
    showDivider: false,
    marginBottom: 24,
  },

  photo: {
    show: true,
    size: 80,
    shape: "circle",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },

  sections: {
    headingStyle: "simple",
    showItemDividers: false,
    itemHeaderLayout: "stacked",
  },

  skills: {
    display: "tags",
    tagShape: "pill",
  },

  languages: {
    display: "list",
    showLevel: true,
    levelStyle: "text",
  },
};

// ==================== EXECUTIVE TEMPLATE ====================
export const executiveTemplate: TemplateDefinition = {
  id: "executive",
  name: "Executive",
  description: "Sophisticated design for senior professionals and executives",
  tags: ["Executive", "Senior", "Formal"],
  isBuiltIn: true,
  isCustomizable: true,

  layout: {
    type: "single-column",
    pagePadding: { top: 48, right: 48, bottom: 48, left: 48 },
    sectionGap: 28,
    itemGap: 18,
  },

  typography: {
    baseFontFamily: "lora",
    name: {
      fontSize: 36,
      fontWeight: "normal",
      color: "#1e293b",
      letterSpacing: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: "normal",
      color: "#64748b",
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    sectionHeading: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#334155",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    itemTitle: {
      fontSize: 13,
      fontWeight: "bold",
      color: "#1e293b",
    },
    itemSubtitle: {
      fontSize: 11,
      fontWeight: "normal",
      color: "#475569",
    },
    date: {
      fontSize: 10,
      color: "#64748b",
    },
    body: {
      fontSize: 10,
      color: "#475569",
      lineHeight: 1.6,
    },
    contact: {
      fontSize: 10,
      color: "#64748b",
    },
    skillTag: {
      fontSize: 10,
      color: "#475569",
    },
  },

  colors: {
    primary: "#1e3a5f",
    background: "#ffffff",
    text: "#1e293b",
    mutedText: "#64748b",
    border: "#cbd5e1",
    skillTagBackground: "#f8fafc",
    skillTagText: "#475569",
  },

  header: {
    layout: "split",
    showPhoto: false,
    showContactIcons: false,
    contactLayout: "stacked",
    showDivider: true,
    marginBottom: 28,
  },

  photo: {
    show: false,
    size: 0,
    shape: "square",
    borderWidth: 0,
  },

  sections: {
    headingStyle: "accent-left",
    showItemDividers: true,
    itemHeaderLayout: "inline",
  },

  skills: {
    display: "grid",
    columns: 3,
  },

  languages: {
    display: "grid",
    showLevel: true,
    levelStyle: "bar",
  },
};

// ==================== TEMPLATE REGISTRY ====================

const builtInTemplates: TemplateDefinition[] = [
  modernTemplate,
  minimalTemplate,
  creativeTemplate,
  executiveTemplate,
];

const templateMap = new Map<string, TemplateDefinition>();

// Initialize with built-in templates
builtInTemplates.forEach((t) => templateMap.set(t.id, t));

export const templateRegistry = {
  templates: templateMap,

  get(id: string): TemplateDefinition | undefined {
    return templateMap.get(id);
  },

  getAll(): TemplateDefinition[] {
    return Array.from(templateMap.values());
  },

  getBuiltIn(): TemplateDefinition[] {
    return Array.from(templateMap.values()).filter((t) => t.isBuiltIn);
  },

  register(template: TemplateDefinition): void {
    templateMap.set(template.id, template);
  },

  /** Get default template */
  getDefault(): TemplateDefinition {
    return modernTemplate;
  },
};

export default templateRegistry;

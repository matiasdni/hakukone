/**
 * Template Engine Type Definitions
 *
 * This module defines the schema for resume templates, enabling:
 * - Built-in templates with consistent structure
 * - User-customizable templates
 * - Unified rendering for both HTML and PDF
 */

// ==================== LAYOUT ====================

export type LayoutType = "single-column" | "two-column" | "two-column-sidebar";

export interface LayoutConfig {
  type: LayoutType;
  /** For two-column layouts, the width of the sidebar (e.g., "35%", "300px") */
  sidebarWidth?: string;
  /** Which side the sidebar appears on */
  sidebarPosition?: "left" | "right";
  /** Sections that appear in the sidebar (for two-column layouts) */
  sidebarSections?: string[];
  /** Page padding in points/pixels */
  pagePadding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Gap between sections */
  sectionGap: number;
  /** Gap between items within a section */
  itemGap: number;
}

// ==================== TYPOGRAPHY ====================

export type FontFamily =
  | "inter"
  | "source-sans"
  | "merriweather"
  | "lora"
  | "jetbrains-mono";
export type FontWeight = "normal" | "medium" | "semibold" | "bold";
export type TextAlign = "left" | "center" | "right" | "justify";
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";

export interface TypographyStyle {
  fontFamily?: FontFamily;
  fontSize: number;
  fontWeight?: FontWeight;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: TextAlign;
  textTransform?: TextTransform;
}

export interface TypographyConfig {
  /** Base font family for the document */
  baseFontFamily: FontFamily;
  /** Name styling */
  name: TypographyStyle;
  /** Professional title styling */
  title: TypographyStyle;
  /** Section headings */
  sectionHeading: TypographyStyle;
  /** Item titles (job title, degree, etc.) */
  itemTitle: TypographyStyle;
  /** Item subtitles (company name, school, etc.) */
  itemSubtitle: TypographyStyle;
  /** Dates */
  date: TypographyStyle;
  /** Body text / descriptions */
  body: TypographyStyle;
  /** Contact information */
  contact: TypographyStyle;
  /** Skill tags */
  skillTag: TypographyStyle;
}

// ==================== COLORS ====================

export interface ColorConfig {
  /** Primary accent color */
  primary: string;
  /** Secondary accent color */
  secondary?: string;
  /** Background color for main content */
  background: string;
  /** Background color for sidebar (if applicable) */
  sidebarBackground?: string;
  /** Text color for main content */
  text: string;
  /** Text color for sidebar (if applicable) */
  sidebarText?: string;
  /** Muted text color (dates, secondary info) */
  mutedText: string;
  /** Border/divider color */
  border: string;
  /** Skill tag background */
  skillTagBackground?: string;
  /** Skill tag text color */
  skillTagText?: string;
}

// ==================== HEADER ====================

export type HeaderLayout = "left" | "center" | "split";

export interface HeaderConfig {
  layout: HeaderLayout;
  /** Show photo in header */
  showPhoto: boolean;
  /** Photo size in pixels */
  photoSize?: number;
  /** Photo shape */
  photoShape?: "circle" | "rounded" | "square";
  /** Show icons next to contact info */
  showContactIcons: boolean;
  /** Contact items layout */
  contactLayout: "inline" | "stacked" | "grid";
  /** Divider below header */
  showDivider: boolean;
  /** Spacing below header */
  marginBottom: number;
}

// ==================== SECTIONS ====================

export interface SectionStyle {
  /** Heading style variant */
  headingStyle: "simple" | "underlined" | "boxed" | "accent-left";
  /** Show divider between items */
  showItemDividers: boolean;
  /** Item header layout (title/date on same line or stacked) */
  itemHeaderLayout: "inline" | "stacked";
}

export interface SkillsStyle {
  /** How skills are displayed */
  display: "tags" | "inline" | "list" | "grid";
  /** For tags: shape */
  tagShape?: "rounded" | "pill" | "square";
  /** For inline: separator */
  separator?: string;
  /** Number of columns for grid */
  columns?: number;
}

export interface LanguagesStyle {
  /** How languages are displayed */
  display: "inline" | "list" | "grid";
  /** Show level indicator */
  showLevel: boolean;
  /** Level display style */
  levelStyle?: "text" | "dots" | "bar";
}

// ==================== TEMPLATE DEFINITION ====================

export interface TemplateDefinition {
  /** Unique template identifier */
  id: string;
  /** Display name */
  name: string;
  /** Template description */
  description: string;
  /** Preview thumbnail URL */
  thumbnail?: string;
  /** Template tags for filtering */
  tags: string[];
  /** Whether this is a built-in or user-created template */
  isBuiltIn: boolean;
  /** Whether users can customize this template */
  isCustomizable: boolean;

  // Configuration
  layout: LayoutConfig;
  typography: TypographyConfig;
  colors: ColorConfig;
  header: HeaderConfig;
  /** Photo display options */
  photo: PhotoOptions;
  sections: SectionStyle;
  skills: SkillsStyle;
  languages: LanguagesStyle;
}

// ==================== SECTION VISIBILITY ====================

/**
 * Controls which sections are visible and in what order
 */
export interface SectionVisibility {
  id: string;
  type: SectionType;
  visible: boolean;
  /** Custom display name override */
  displayName?: string;
}

export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "custom";

// ==================== PHOTO OPTIONS ====================

export interface PhotoOptions {
  /** Whether to show the photo */
  show: boolean;
  /** Size in pixels */
  size: number;
  /** Photo shape */
  shape: "circle" | "rounded" | "square";
  /** Border width in pixels */
  borderWidth: number;
  /** Border color */
  borderColor?: string;
  /** Position in header */
  position?: "left" | "right" | "center";
  /** Grayscale filter */
  grayscale?: boolean;
}

// ==================== USER OVERRIDES ====================

/**
 * Users can override any part of a template
 * This allows full customization without defining everything
 */
export interface TemplateOverrides {
  // Layout overrides
  layout?: Partial<LayoutConfig>;

  // Full typography overrides
  typography?: Partial<TypographyConfig>;

  // Color overrides
  colors?: Partial<ColorConfig>;

  // Header overrides
  header?: Partial<HeaderConfig>;

  // Photo overrides
  photo?: Partial<PhotoOptions>;

  // Section styling overrides
  sections?: Partial<SectionStyle>;

  // Skills display overrides
  skills?: Partial<SkillsStyle>;

  // Languages display overrides
  languages?: Partial<LanguagesStyle>;

  // Section visibility and ordering
  sectionVisibility?: SectionVisibility[];
}

/**
 * A resolved template with user overrides applied
 */
export type ResolvedTemplate = TemplateDefinition & {
  /** Photo options (resolved from header or overrides) */
  photo: PhotoOptions;
  /** Section visibility configuration */
  sectionVisibility?: SectionVisibility[];
};

// ==================== HELPER TYPES ====================

export interface TemplateRegistry {
  templates: Map<string, TemplateDefinition>;
  get: (id: string) => TemplateDefinition | undefined;
  getAll: () => TemplateDefinition[];
  getBuiltIn: () => TemplateDefinition[];
  register: (template: TemplateDefinition) => void;
}

"use client";

import { ResumeData } from "@/types";
import { ResolvedTemplate, TemplateOverrides } from "../../types";
import {
  resolveTemplate,
  colorsToCustomProperties,
  getFontFamilyClass,
} from "../../index";
import { HeaderSection } from "./sections/HeaderSection";
import { SummarySection } from "./sections/SummarySection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { CustomSection } from "./sections/CustomSection";

interface TemplateRendererProps {
  resume: ResumeData;
  templateId: string;
  overrides?: TemplateOverrides;
  className?: string;
}

// Default section order if none provided
const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
];

/**
 * Get the ordered list of visible sections
 */
function getVisibleSections(
  template: ResolvedTemplate,
  resume: ResumeData
): string[] {
  // If template has section visibility config, use that
  if (template.sectionVisibility && template.sectionVisibility.length > 0) {
    return template.sectionVisibility.filter((s) => s.visible).map((s) => s.id);
  }

  // Otherwise use resume's sectionOrder or default
  // For custom sections, use the section id; for built-in sections, use the type
  if (resume.sectionOrder && resume.sectionOrder.length > 0) {
    return resume.sectionOrder.map((s) =>
      s.type === "custom" ? s.id : s.type
    );
  }

  return DEFAULT_SECTION_ORDER;
}

/**
 * Generic template renderer that takes a template ID and resume data
 * and renders the appropriate HTML structure
 */
export function TemplateRenderer({
  resume,
  templateId,
  overrides,
  className = "",
}: TemplateRendererProps) {
  // Resolve template with any user overrides
  const template = resolveTemplate(templateId, overrides);
  const { layout, colors, typography } = template;

  // Generate CSS custom properties for colors
  const colorStyles = colorsToCustomProperties(colors);

  // Get font family class
  const fontFamilyClass = getFontFamilyClass(typography.baseFontFamily);

  // Get visible sections in order
  const visibleSections = getVisibleSections(template, resume);

  // Container styles based on layout type
  const containerStyles: React.CSSProperties = {
    ...colorStyles,
    backgroundColor: colors.background,
    color: colors.text,
    minHeight: "100%",
    // Only apply page padding for non-sidebar layouts
    ...(layout.type !== "two-column-sidebar" && {
      paddingTop: layout.pagePadding.top,
      paddingRight: layout.pagePadding.right,
      paddingBottom: layout.pagePadding.bottom,
      paddingLeft: layout.pagePadding.left,
    }),
  };

  // Determine which sections go in sidebar vs main (for sidebar layouts)
  const sidebarSections = layout.sidebarSections || ["skills", "languages"];

  // Check for two-column sidebar layout
  const isTwoColumnSidebar = layout.type === "two-column-sidebar";

  if (isTwoColumnSidebar) {
    return (
      <div
        className={`template-container ${fontFamilyClass} ${className}`}
        style={containerStyles}
      >
        <SidebarLayout
          resume={resume}
          template={template}
          sidebarPosition={layout.sidebarPosition || "left"}
          sidebarSections={sidebarSections}
          visibleSections={visibleSections}
        />
      </div>
    );
  }

  // Default single-column or two-column layout
  return (
    <div
      className={`template-container ${fontFamilyClass} ${className}`}
      style={containerStyles}
    >
      <SingleColumnLayout
        resume={resume}
        template={template}
        visibleSections={visibleSections}
      />
    </div>
  );
}

interface SingleColumnLayoutProps {
  resume: ResumeData;
  template: ResolvedTemplate;
  visibleSections: string[];
}

function SingleColumnLayout({
  resume,
  template,
  visibleSections,
}: SingleColumnLayoutProps) {
  const { layout } = template;

  return (
    <div className="single-column-layout">
      <HeaderSection resume={resume} template={template} />

      <div
        className="sections-container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${layout.sectionGap}px`,
        }}
      >
        {visibleSections.map((sectionId: string) => (
          <SectionRenderer
            key={sectionId}
            sectionId={sectionId}
            resume={resume}
            template={template}
          />
        ))}
      </div>
    </div>
  );
}

interface SidebarLayoutProps {
  resume: ResumeData;
  template: ResolvedTemplate;
  sidebarPosition: "left" | "right";
  sidebarSections: string[];
  visibleSections: string[];
}

function SidebarLayout({
  resume,
  template,
  sidebarPosition,
  sidebarSections,
  visibleSections,
}: SidebarLayoutProps) {
  const { layout, colors } = template;

  // Separate sections into sidebar and main based on visible sections
  const mainSections = visibleSections.filter(
    (s: string) => !sidebarSections.includes(s)
  );
  const sidebarSectionList = visibleSections.filter((s: string) =>
    sidebarSections.includes(s)
  );

  const sidebarWidth = layout.sidebarWidth || "30%";
  const padding = `${layout.pagePadding.top}px ${layout.pagePadding.right}px ${layout.pagePadding.bottom}px ${layout.pagePadding.left}px`;

  const sidebarStyle: React.CSSProperties = {
    width: sidebarWidth,
    flexShrink: 0,
    backgroundColor: colors.sidebarBackground || colors.primary,
    color: colors.sidebarText || "#ffffff",
    padding: padding,
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: padding,
    backgroundColor: colors.background,
  };

  const Sidebar = (
    <aside style={sidebarStyle} className="sidebar">
      <div
        style={{
          gap: `${layout.sectionGap}px`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {sidebarSectionList.map((sectionId: string) => (
          <SectionRenderer
            key={sectionId}
            sectionId={sectionId}
            resume={resume}
            template={template}
            inSidebar={true}
          />
        ))}
      </div>
    </aside>
  );

  const Main = (
    <main style={mainStyle} className="main-content">
      <HeaderSection resume={resume} template={template} />
      <div
        className="sections-container"
        style={{
          gap: `${layout.sectionGap}px`,
          display: "flex",
          flexDirection: "column",
          marginTop: "1.5rem",
        }}
      >
        {mainSections.map((sectionId: string) => (
          <SectionRenderer
            key={sectionId}
            sectionId={sectionId}
            resume={resume}
            template={template}
          />
        ))}
      </div>
    </main>
  );

  return (
    <div
      className="sidebar-layout"
      style={{ display: "flex", minHeight: "297mm" }}
    >
      {sidebarPosition === "left" ? (
        <>
          {Sidebar}
          {Main}
        </>
      ) : (
        <>
          {Main}
          {Sidebar}
        </>
      )}
    </div>
  );
}

interface SectionRendererProps {
  sectionId: string;
  resume: ResumeData;
  template: ResolvedTemplate;
  inSidebar?: boolean;
}

function SectionRenderer({
  sectionId,
  resume,
  template,
}: SectionRendererProps) {
  switch (sectionId) {
    case "summary":
      return <SummarySection resume={resume} template={template} />;

    case "experience":
      return <ExperienceSection resume={resume} template={template} />;

    case "education":
      return <EducationSection resume={resume} template={template} />;

    case "skills":
      return <SkillsSection resume={resume} template={template} />;

    case "languages":
      return <LanguagesSection resume={resume} template={template} />;

    default: {
      // Check if this is a custom section
      const customSection = resume.customSections?.find(
        (s) => s.id === sectionId
      );
      if (customSection) {
        return <CustomSection section={customSection} template={template} />;
      }
      return null;
    }
  }
}

export default TemplateRenderer;

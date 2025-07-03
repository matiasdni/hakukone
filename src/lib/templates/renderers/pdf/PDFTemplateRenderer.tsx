"use client";

import type { ResumeData } from "@/types";
import { Document, Font, Page, Text, View } from "@react-pdf/renderer";
import React from "react";
import { resolveTemplate } from "../../index";
import type {
  ResolvedTemplate,
  SectionVisibility,
  TemplateOverrides,
} from "../../types";
import {
  CustomSection,
  EducationSection,
  ExperienceSection,
  HeaderSection,
  LanguagesSection,
  SkillsSection,
  SummarySection,
} from "./PDFSections";
import { getFontFamily, typographyToPDFStyle } from "./pdfUtils";

// Page footer component for page numbers
const PageFooter: React.FC<{ color: string }> = ({ color }) => (
  <Text
    style={{
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 9,
      color: color,
    }}
    render={({ pageNumber, totalPages }) =>
      totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
    }
    fixed
  />
);

// Register fonts (using system-compatible fonts)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

Font.register({
  family: "Times-Roman",
  fonts: [
    { src: "Times-Roman" },
    { src: "Times-Bold", fontWeight: "bold" },
    { src: "Times-Italic", fontStyle: "italic" },
  ],
});

Font.register({
  family: "Courier",
  fonts: [
    { src: "Courier" },
    { src: "Courier-Bold", fontWeight: "bold" },
    { src: "Courier-Oblique", fontStyle: "italic" },
  ],
});

// ==================== SECTION RENDERER ====================

// Default section order
const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
];

// Get visible sections in order (matches HTML renderer logic)
function getVisibleSections(
  template: ResolvedTemplate,
  resume: ResumeData
): string[] {
  // If template has section visibility config, use that
  if (template.sectionVisibility && template.sectionVisibility.length > 0) {
    return template.sectionVisibility
      .filter((s: SectionVisibility) => s.visible)
      .map((s: SectionVisibility) => s.id);
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

// PDF Section Renderer
interface PDFSectionRendererProps {
  sectionId: string;
  resume: ResumeData;
  template: ResolvedTemplate;
}

const PDFSectionRenderer: React.FC<PDFSectionRendererProps> = ({
  sectionId,
  resume,
  template,
}) => {
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
};

// ==================== MAIN PDF DOCUMENT ====================

interface PDFTemplateRendererProps {
  resume: ResumeData;
  templateId: string;
  overrides?: TemplateOverrides;
}

export const PDFTemplateRenderer: React.FC<PDFTemplateRendererProps> = ({
  resume,
  templateId,
  overrides,
}) => {
  const template = resolveTemplate(templateId, overrides);
  const { layout, colors, typography } = template;

  const pageStyle = {
    paddingTop: layout.pagePadding.top,
    paddingRight: layout.pagePadding.right,
    paddingBottom: layout.pagePadding.bottom,
    paddingLeft: layout.pagePadding.left,
    fontFamily: getFontFamily(typography.baseFontFamily),
    fontSize: typography.body.fontSize,
    color: colors.text,
    backgroundColor: colors.background,
  };

  // For two-column sidebar layout
  if (layout.type === "two-column-sidebar") {
    const sidebarSectionIds = layout.sidebarSections || ["skills", "languages"];
    const visibleSections = getVisibleSections(template, resume);
    const mainSectionIds = visibleSections.filter(
      (s) => !sidebarSectionIds.includes(s)
    );
    const sidebarSections = visibleSections.filter((s) =>
      sidebarSectionIds.includes(s)
    );

    return (
      <Document>
        <Page size="A4" style={{ flexDirection: "row" }} wrap>
          {/* Sidebar */}
          <View
            style={{
              width: layout.sidebarWidth || "35%",
              backgroundColor: colors.sidebarBackground || colors.primary,
              padding: 20,
            }}
            fixed
          >
            {/* Name and title in sidebar for creative template */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  ...typographyToPDFStyle(
                    typography.name,
                    typography.baseFontFamily
                  ),
                  color: colors.sidebarText || "#ffffff",
                }}
              >
                {resume.fullName}
              </Text>
              {resume.title && (
                <Text
                  style={{
                    ...typographyToPDFStyle(
                      typography.title,
                      typography.baseFontFamily
                    ),
                    color: colors.secondary || colors.sidebarText || "#ffffff",
                    opacity: 0.8,
                    marginTop: 4,
                  }}
                >
                  {resume.title}
                </Text>
              )}
            </View>

            {/* Sidebar sections using section renderer */}
            {sidebarSections.map((sectionId) => (
              <PDFSectionRenderer
                key={sectionId}
                sectionId={sectionId}
                resume={resume}
                template={template}
              />
            ))}
          </View>

          {/* Main content */}
          <View
            style={{
              flex: 1,
              padding: layout.pagePadding.right || 30,
              backgroundColor: colors.background,
            }}
          >
            {/* Contact info */}
            <View style={{ marginBottom: 20 }}>
              {[resume.email, resume.phone, resume.location]
                .filter(Boolean)
                .map((item, index) => (
                  <Text
                    key={index}
                    style={{
                      fontSize: 9,
                      color: colors.mutedText,
                      marginBottom: 2,
                    }}
                  >
                    {item}
                  </Text>
                ))}
            </View>

            {/* Main sections using section renderer */}
            {mainSectionIds.map((sectionId) => (
              <PDFSectionRenderer
                key={sectionId}
                sectionId={sectionId}
                resume={resume}
                template={template}
              />
            ))}
          </View>

          {/* Page numbers */}
          <PageFooter color={colors.mutedText} />
        </Page>
      </Document>
    );
  }

  // Single column layout
  const visibleSections = getVisibleSections(template, resume);

  return (
    <Document>
      <Page size="A4" style={pageStyle} wrap>
        <HeaderSection resume={resume} template={template} />
        {visibleSections.map((sectionId) => (
          <PDFSectionRenderer
            key={sectionId}
            sectionId={sectionId}
            resume={resume}
            template={template}
          />
        ))}
        {/* Page numbers */}
        <PageFooter color={colors.mutedText} />
      </Page>
    </Document>
  );
};

export default PDFTemplateRenderer;

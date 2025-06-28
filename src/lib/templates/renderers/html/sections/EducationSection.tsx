"use client";

import { ResumeData } from "@/types";
import { ResolvedTemplate } from "../../../types";
import { typographyToCSS } from "../../../index";
import { SectionHeading, getSectionHeadingStyle } from "./SummarySection";

interface EducationSectionProps {
  resume: ResumeData;
  template: ResolvedTemplate;
}

export function EducationSection({ resume, template }: EducationSectionProps) {
  const { typography, colors, sections, layout } = template;

  if (!resume.education || resume.education.length === 0) {
    return null;
  }

  const headingStyle = getSectionHeadingStyle(
    sections.headingStyle,
    typography,
    colors
  );

  const itemTitleStyle: React.CSSProperties = {
    ...typographyToCSS(typography.itemTitle),
    color: colors.text,
  };

  const itemSubtitleStyle: React.CSSProperties = {
    ...typographyToCSS(typography.itemSubtitle),
    color: colors.mutedText,
  };

  const dateStyle: React.CSSProperties = {
    ...typographyToCSS(typography.date),
    color: colors.mutedText,
  };

  const itemGap = `${layout.itemGap}px`;

  return (
    <section className="education-section">
      <SectionHeading
        title="Education"
        style={headingStyle}
        headingType={sections.headingStyle}
        accentColor={colors.primary}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: itemGap }}>
        {resume.education.map((edu, index) => (
          <div key={edu.id} className="education-item">
            {sections.itemHeaderLayout === "inline" ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span style={itemTitleStyle}>{edu.degree}</span>
                  <span style={{ ...itemSubtitleStyle, marginLeft: "0.5rem" }}>
                    at {edu.school}
                  </span>
                </div>
                <span style={dateStyle}>{edu.year}</span>
              </div>
            ) : (
              <div>
                <div style={itemTitleStyle}>{edu.degree}</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span style={itemSubtitleStyle}>{edu.school}</span>
                  <span style={dateStyle}>{edu.year}</span>
                </div>
              </div>
            )}
            {/* Item divider */}
            {sections.showItemDividers &&
              index < resume.education.length - 1 && (
                <div
                  style={{
                    borderBottom: `1px solid ${colors.border}`,
                    marginTop: itemGap,
                    opacity: 0.5,
                  }}
                />
              )}
          </div>
        ))}
      </div>
    </section>
  );
}

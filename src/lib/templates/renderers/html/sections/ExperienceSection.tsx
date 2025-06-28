"use client";

import { ResumeData } from "@/types";
import { ResolvedTemplate } from "../../../types";
import { typographyToCSS } from "../../../index";
import { SectionHeading, getSectionHeadingStyle } from "./SummarySection";

interface ExperienceSectionProps {
  resume: ResumeData;
  template: ResolvedTemplate;
}

export function ExperienceSection({
  resume,
  template,
}: ExperienceSectionProps) {
  const { typography, colors, sections, layout } = template;

  if (!resume.experience || resume.experience.length === 0) {
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

  const bodyStyle: React.CSSProperties = {
    ...typographyToCSS(typography.body),
    color: colors.text,
  };

  const itemGap = `${layout.itemGap}px`;

  return (
    <section className="experience-section">
      <SectionHeading
        title="Experience"
        style={headingStyle}
        headingType={sections.headingStyle}
        accentColor={colors.primary}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: itemGap }}>
        {resume.experience.map((exp, index) => (
          <div key={exp.id} className="experience-item">
            {sections.itemHeaderLayout === "inline" ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "0.25rem",
                }}
              >
                <div>
                  <span style={itemTitleStyle}>{exp.role}</span>
                  <span style={{ ...itemSubtitleStyle, marginLeft: "0.5rem" }}>
                    at {exp.company}
                  </span>
                </div>
                <span style={dateStyle}>
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
            ) : (
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={itemTitleStyle}>{exp.role}</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span style={itemSubtitleStyle}>{exp.company}</span>
                  <span style={dateStyle}>
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
              </div>
            )}
            {exp.description && (
              <div
                style={bodyStyle}
                dangerouslySetInnerHTML={{ __html: exp.description }}
              />
            )}
            {/* Item divider */}
            {sections.showItemDividers &&
              index < resume.experience.length - 1 && (
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

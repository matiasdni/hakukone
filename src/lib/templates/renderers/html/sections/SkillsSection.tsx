"use client";

import { ResumeData } from "@/types";
import { ResolvedTemplate } from "../../../types";
import { typographyToCSS } from "../../../index";
import { SectionHeading, getSectionHeadingStyle } from "./SummarySection";

interface SkillsSectionProps {
  resume: ResumeData;
  template: ResolvedTemplate;
}

export function SkillsSection({ resume, template }: SkillsSectionProps) {
  const { typography, colors, sections, skills: skillsStyle } = template;

  if (!resume.skills || resume.skills.length === 0) {
    return null;
  }

  const headingStyle = getSectionHeadingStyle(
    sections.headingStyle,
    typography,
    colors
  );

  const tagStyle: React.CSSProperties = {
    ...typographyToCSS(typography.skillTag),
    backgroundColor: colors.skillTagBackground || colors.primary + "20",
    color: colors.skillTagText || colors.primary,
    padding: "0.25rem 0.75rem",
    borderRadius:
      skillsStyle.tagShape === "pill"
        ? "9999px"
        : skillsStyle.tagShape === "square"
          ? "0"
          : "0.375rem",
    display: "inline-block",
  };

  const inlineStyle: React.CSSProperties = {
    ...typographyToCSS(typography.body),
    color: colors.text,
  };

  const renderSkills = () => {
    switch (skillsStyle.display) {
      case "tags":
        return (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {resume.skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  ...tagStyle,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        );

      case "inline":
        return (
          <p style={{ ...inlineStyle, wordBreak: "break-word" }}>
            {resume.skills.join(skillsStyle.separator || " • ")}
          </p>
        );

      case "list":
        return (
          <ul style={{ ...inlineStyle, paddingLeft: "1.25rem", margin: 0 }}>
            {resume.skills.map((skill, index) => (
              <li key={index} style={{ wordBreak: "break-word" }}>
                {skill}
              </li>
            ))}
          </ul>
        );

      case "grid":
        const columns = skillsStyle.columns || 2;
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: "0.5rem",
              maxWidth: "100%",
            }}
          >
            {resume.skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  ...inlineStyle,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        );

      default:
        return (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {resume.skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  ...tagStyle,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        );
    }
  };

  return (
    <section className="skills-section">
      <SectionHeading
        title="Skills"
        style={headingStyle}
        headingType={sections.headingStyle}
        accentColor={colors.primary}
      />
      {renderSkills()}
    </section>
  );
}

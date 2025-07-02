"use client";

import { ResumeData } from "@/types";
import { ResolvedTemplate } from "../../../types";
import { typographyToCSS } from "../../../index";
import { SectionHeading, getSectionHeadingStyle } from "./SummarySection";

interface LanguagesSectionProps {
  resume: ResumeData;
  template: ResolvedTemplate;
}

export function LanguagesSection({ resume, template }: LanguagesSectionProps) {
  const { typography, colors, sections, languages: languagesStyle } = template;

  if (!resume.languages || resume.languages.length === 0) {
    return null;
  }

  const headingStyle = getSectionHeadingStyle(
    sections.headingStyle,
    typography,
    colors
  );

  const bodyStyle: React.CSSProperties = {
    ...typographyToCSS(typography.body),
    color: colors.text,
  };

  const mutedStyle: React.CSSProperties = {
    ...typographyToCSS(typography.body),
    color: colors.mutedText,
    fontSize: typography.body.fontSize * 0.9 + "px",
  };

  const renderLanguageLevel = (level: string) => {
    if (!languagesStyle.showLevel) {
      return null;
    }

    if (languagesStyle.levelStyle === "dots") {
      const levelMap: Record<string, number> = {
        Basic: 1,
        Intermediate: 2,
        Proficient: 3,
        Fluent: 4,
        Native: 5,
      };
      const filledDots = levelMap[level] || 3;

      return (
        <span
          style={{
            marginLeft: "0.5rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor:
                  i <= filledDots ? colors.primary : colors.border,
                flexShrink: 0,
              }}
            />
          ))}
        </span>
      );
    }

    if (languagesStyle.levelStyle === "bar") {
      const levelMap: Record<string, number> = {
        Basic: 20,
        Intermediate: 40,
        Proficient: 60,
        Fluent: 80,
        Native: 100,
      };
      const width = levelMap[level] || 60;

      return (
        <div
          style={{
            marginLeft: "0.5rem",
            width: "50px",
            height: "4px",
            backgroundColor: colors.border,
            borderRadius: "2px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: `${width}%`,
              height: "100%",
              backgroundColor: colors.primary,
              borderRadius: "2px",
            }}
          />
        </div>
      );
    }

    // Default: text
    return <span style={mutedStyle}> ({level})</span>;
  };

  const renderLanguages = () => {
    switch (languagesStyle.display) {
      case "inline":
        return (
          <p style={bodyStyle}>
            {resume.languages?.map((lang, index) => (
              <span key={lang.id}>
                {lang.name}
                {languagesStyle.showLevel &&
                  languagesStyle.levelStyle === "text" && (
                    <span style={mutedStyle}> ({lang.level})</span>
                  )}
                {index < (resume.languages?.length || 0) - 1 && ", "}
              </span>
            ))}
          </p>
        );

      case "grid":
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.5rem",
            }}
          >
            {resume.languages?.map((lang) => (
              <div
                key={lang.id}
                style={{ display: "flex", alignItems: "center" }}
              >
                <span style={bodyStyle}>{lang.name}</span>
                {renderLanguageLevel(lang.level)}
              </div>
            ))}
          </div>
        );

      case "list":
      default:
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            {resume.languages?.map((lang) => (
              <div
                key={lang.id}
                style={{ display: "flex", alignItems: "center" }}
              >
                <span style={bodyStyle}>{lang.name}</span>
                {renderLanguageLevel(lang.level)}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <section className="languages-section">
      <SectionHeading
        title="Languages"
        style={headingStyle}
        headingType={sections.headingStyle}
        accentColor={colors.primary}
      />
      {renderLanguages()}
    </section>
  );
}

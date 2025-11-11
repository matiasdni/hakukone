"use client";

import { ResumeData } from "@/types";
import { typographyToCSS } from "../../../index";
import { ResolvedTemplate } from "../../../types";

interface SummarySectionProps {
  resume: ResumeData;
  template: ResolvedTemplate;
}

export function SummarySection({ resume, template }: SummarySectionProps) {
  const { typography, colors, sections } = template;

  if (!resume.summary) {
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

  return (
    <section className="summary-section">
      <SectionHeading
        title="Summary"
        style={headingStyle}
        headingType={sections.headingStyle}
        accentColor={colors.primary}
      />
      <div
        style={bodyStyle}
        dangerouslySetInnerHTML={{ __html: resume.summary }}
        className="summary-content"
      />
    </section>
  );
}

// Shared section heading component
interface SectionHeadingProps {
  title: string;
  style: React.CSSProperties;
  headingType: "simple" | "underlined" | "boxed" | "accent-left";
  accentColor: string;
}

function SectionHeading({
  title,
  style,
  headingType,
  accentColor,
}: SectionHeadingProps) {
  const wrapperStyle: React.CSSProperties = {};

  if (headingType === "accent-left") {
    wrapperStyle.display = "flex";
    wrapperStyle.alignItems = "center";
    wrapperStyle.gap = "0.75rem";
  }

  if (headingType === "underlined") {
    wrapperStyle.borderBottom = `2px solid ${accentColor}`;
    wrapperStyle.paddingBottom = "0.5rem";
    wrapperStyle.marginBottom = "1rem";
  }

  if (headingType === "boxed") {
    wrapperStyle.backgroundColor = accentColor;
    wrapperStyle.color = "#ffffff";
    wrapperStyle.padding = "0.5rem 1rem";
    wrapperStyle.marginBottom = "1rem";
  }

  // For accent-left, ensure heading is left-aligned and has no extra margin
  const headingStyle: React.CSSProperties = {
    ...style,
    ...(headingType === "accent-left"
      ? {
          textAlign: "left",
          margin: 0,
          flex: 1,
        }
      : {}),
  };

  return (
    <div style={wrapperStyle}>
      {headingType === "accent-left" && (
        <div
          style={{
            width: "4px",
            height: "1.5rem",
            backgroundColor: accentColor,
            flexShrink: 0,
          }}
        />
      )}
      <h3 style={headingStyle}>{title}</h3>
    </div>
  );
}

function getSectionHeadingStyle(
  headingType: "simple" | "underlined" | "boxed" | "accent-left",
  typography: ResolvedTemplate["typography"],
  colors: ResolvedTemplate["colors"]
): React.CSSProperties {
  const baseStyle = typographyToCSS(typography.sectionHeading);

  if (headingType === "boxed") {
    return {
      ...baseStyle,
      color: "#ffffff",
      marginBottom: "0",
    };
  }

  return {
    ...baseStyle,
    color: colors.primary,
    marginBottom: headingType === "underlined" ? "0" : "0.75rem",
  };
}

export { getSectionHeadingStyle, SectionHeading };

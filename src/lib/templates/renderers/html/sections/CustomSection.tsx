"use client";

import { CustomSection as CustomSectionType } from "@/types";
import { ResolvedTemplate } from "../../../types";
import { typographyToCSS } from "../../../index";
import { SectionHeading, getSectionHeadingStyle } from "./SummarySection";

interface CustomSectionProps {
  section: CustomSectionType;
  template: ResolvedTemplate;
}

export function CustomSection({ section, template }: CustomSectionProps) {
  const { typography, colors, sections, layout } = template;

  if (!section.items || section.items.length === 0) {
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
    <section className="custom-section">
      <SectionHeading
        title={section.title}
        style={headingStyle}
        headingType={sections.headingStyle}
        accentColor={colors.primary}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: itemGap }}>
        {section.items.map((item) => (
          <div key={item.id} className="custom-item">
            {sections.itemHeaderLayout === "inline" ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <div>
                    <span style={itemTitleStyle}>{item.title}</span>
                    {item.subtitle && (
                      <span
                        style={{ ...itemSubtitleStyle, marginLeft: "0.5rem" }}
                      >
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                  {item.date && <span style={dateStyle}>{item.date}</span>}
                </div>
                {item.description && (
                  <div
                    style={{ ...bodyStyle, marginTop: "0.25rem" }}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                )}
              </>
            ) : (
              <div>
                <div style={itemTitleStyle}>{item.title}</div>
                {(item.subtitle || item.date) && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    {item.subtitle && (
                      <span style={itemSubtitleStyle}>{item.subtitle}</span>
                    )}
                    {item.date && <span style={dateStyle}>{item.date}</span>}
                  </div>
                )}
                {item.description && (
                  <div
                    style={{ ...bodyStyle, marginTop: "0.25rem" }}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

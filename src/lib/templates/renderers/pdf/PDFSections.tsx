"use client";

import type { CustomSection as CustomSectionType, ResumeData } from "@/types";
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";
import type { TemplateDefinition } from "../../types";
import { typographyToPDFStyle } from "./pdfUtils";
import { parseContent } from "./richTextParser";

type PdfImageStyle = {
  width: number;
  height: number;
  objectFit: "cover" | "contain";
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
};

// ==================== SHARED STYLES ====================

const contentStyles = StyleSheet.create({
  paragraph: {
    marginBottom: 4,
  },
  bulletContainer: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 0,
  },
  bulletPoint: {
    width: 12,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    paddingRight: 10,
  },
  numberedPoint: {
    width: 16,
    fontSize: 9,
  },
});

// ==================== RICH CONTENT COMPONENT ====================

interface RichContentProps {
  content: string;
  style?: {
    fontSize?: number;
    color?: string;
    lineHeight?: number;
  };
}

export const RichContent: React.FC<RichContentProps> = ({
  content,
  style = {},
}) => {
  const nodes = parseContent(content);
  const textStyle = {
    fontSize: style.fontSize || 9,
    color: style.color || "#475569",
    lineHeight: style.lineHeight || 1.5,
  };

  let bulletCounter = 0;

  return (
    <View>
      {nodes.map((node, index) => {
        switch (node.type) {
          case "paragraph":
            bulletCounter = 0;
            return (
              <Text key={index} style={[textStyle, contentStyles.paragraph]}>
                {node.content}
              </Text>
            );
          case "bullet":
            bulletCounter = 0;
            return (
              <View key={index} style={contentStyles.bulletContainer}>
                <Text style={[textStyle, contentStyles.bulletPoint]}>•</Text>
                <Text style={[textStyle, contentStyles.bulletText]}>
                  {node.content}
                </Text>
              </View>
            );
          case "numbered":
            bulletCounter++;
            return (
              <View key={index} style={contentStyles.bulletContainer}>
                <Text style={[textStyle, contentStyles.numberedPoint]}>
                  {bulletCounter}.
                </Text>
                <Text style={[textStyle, contentStyles.bulletText]}>
                  {node.content}
                </Text>
              </View>
            );
          default:
            return null;
        }
      })}
    </View>
  );
};

// ==================== SECTION HEADING COMPONENT ====================

interface SectionHeadingProps {
  title: string;
  template: TemplateDefinition;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  template,
}) => {
  const { typography, colors, sections } = template;
  const headingStyle = typographyToPDFStyle(
    typography.sectionHeading,
    typography.baseFontFamily
  );

  const baseStyle = {
    ...headingStyle,
    color: colors.primary,
    marginBottom: 8,
  };

  if (sections.headingStyle === "underlined") {
    return (
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.primary,
          paddingBottom: 4,
          marginBottom: 10,
        }}
      >
        <Text style={baseStyle}>{title}</Text>
      </View>
    );
  }

  if (sections.headingStyle === "accent-left") {
    return (
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <View
          style={{
            width: 3,
            height: 14,
            backgroundColor: colors.primary,
            marginRight: 8,
          }}
        />
        <Text style={{ ...baseStyle, marginBottom: 0 }}>{title}</Text>
      </View>
    );
  }

  if (sections.headingStyle === "boxed") {
    return (
      <View
        style={{
          backgroundColor: colors.primary,
          padding: 6,
          marginBottom: 10,
        }}
      >
        <Text style={{ ...baseStyle, color: "#ffffff", marginBottom: 0 }}>
          {title}
        </Text>
      </View>
    );
  }

  // Simple
  return <Text style={baseStyle}>{title}</Text>;
};

// ==================== HEADER SECTION ====================

interface HeaderSectionProps {
  resume: ResumeData;
  template: TemplateDefinition;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  resume,
  template,
}) => {
  const { typography, colors, header, photo } = template;
  const nameStyle = typographyToPDFStyle(
    typography.name,
    typography.baseFontFamily
  );
  const titleStyle = typographyToPDFStyle(
    typography.title,
    typography.baseFontFamily
  );
  const contactStyle = typographyToPDFStyle(
    typography.contact,
    typography.baseFontFamily
  );

  const contactItems: string[] = [];
  if (resume.email) contactItems.push(resume.email);
  if (resume.phone) contactItems.push(resume.phone);
  if (resume.location) contactItems.push(resume.location);
  resume.socialLinks?.forEach((link) => {
    if (link.url) contactItems.push(link.url);
  });

  // Photo settings
  const showPhoto = photo?.show && resume.photoUrl;
  const photoSize = photo?.size || 80;
  const photoShape = photo?.shape || "circle";
  const photoPosition = photo?.position || "right";

  const getPhotoStyle = (): PdfImageStyle => {
    const baseStyle: PdfImageStyle = {
      width: photoSize,
      height: photoSize,
      objectFit: "cover",
    };

    if (photoShape === "circle") {
      baseStyle.borderRadius = photoSize / 2;
    } else if (photoShape === "rounded") {
      baseStyle.borderRadius = 8;
    }

    if (photo?.borderWidth) {
      baseStyle.borderWidth = photo.borderWidth;
      baseStyle.borderColor = photo.borderColor || colors.primary;
    }

    return baseStyle;
  };

  const headerContainerStyle = {
    marginBottom: header.marginBottom,
    ...(header.layout === "center" && !showPhoto
      ? { alignItems: "center" as const }
      : {}),
  };

  // Header content JSX (not a component)
  const headerContentJsx = (
    <View style={{ flex: 1 }}>
      <Text style={{ ...nameStyle, marginBottom: 4 }}>{resume.fullName}</Text>
      {resume.title && (
        <Text style={{ ...titleStyle, marginBottom: 8 }}>{resume.title}</Text>
      )}
      {contactItems.length > 0 && (
        <View
          style={
            header.contactLayout === "stacked"
              ? { flexDirection: "column", gap: 2 }
              : { flexDirection: "row", flexWrap: "wrap", gap: 10 }
          }
        >
          {contactItems.map((item, index) => (
            <Text key={index} style={contactStyle}>
              {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={headerContainerStyle}>
      {showPhoto ? (
        <View
          style={{
            flexDirection: photoPosition === "left" ? "row" : "row-reverse",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text -- PDF Image component from @react-pdf/renderer doesn't support alt */}
          <Image src={resume.photoUrl} style={getPhotoStyle()} />
          {headerContentJsx}
        </View>
      ) : (
        headerContentJsx
      )}
      {header.showDivider && (
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            marginTop: 12,
          }}
        />
      )}
    </View>
  );
};

// ==================== SUMMARY SECTION ====================

interface SummarySectionProps {
  resume: ResumeData;
  template: TemplateDefinition;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  resume,
  template,
}) => {
  if (!resume.summary) return null;

  const { typography, colors, layout } = template;
  const bodyStyle = typographyToPDFStyle(
    typography.body,
    typography.baseFontFamily
  );

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionHeading title="Summary" template={template} />
      <Text style={{ ...bodyStyle, color: colors.text }}>{resume.summary}</Text>
    </View>
  );
};

// ==================== EXPERIENCE SECTION ====================

interface ExperienceSectionProps {
  resume: ResumeData;
  template: TemplateDefinition;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  resume,
  template,
}) => {
  if (!resume.experience || resume.experience.length === 0) return null;

  const { typography, colors, layout, sections } = template;
  const itemTitleStyle = typographyToPDFStyle(
    typography.itemTitle,
    typography.baseFontFamily
  );
  const itemSubtitleStyle = typographyToPDFStyle(
    typography.itemSubtitle,
    typography.baseFontFamily
  );
  const dateStyle = typographyToPDFStyle(
    typography.date,
    typography.baseFontFamily
  );
  const bodyStyle = typographyToPDFStyle(
    typography.body,
    typography.baseFontFamily
  );

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionHeading title="Experience" template={template} />
      {resume.experience.map((exp, index) => (
        <View
          key={exp.id}
          wrap={false}
          style={{
            marginBottom:
              index < resume.experience.length - 1 ? layout.itemGap : 0,
          }}
        >
          {sections.itemHeaderLayout === "inline" ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Text style={{ ...itemTitleStyle, color: colors.text }}>
                  {exp.role}
                </Text>
                <Text
                  style={{
                    ...itemSubtitleStyle,
                    color: colors.mutedText,
                    marginLeft: 8,
                  }}
                >
                  at {exp.company}
                </Text>
              </View>
              <Text style={{ ...dateStyle, color: colors.mutedText }}>
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </Text>
            </View>
          ) : (
            <View style={{ marginBottom: 4 }}>
              <Text style={{ ...itemTitleStyle, color: colors.text }}>
                {exp.role}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ ...itemSubtitleStyle, color: colors.mutedText }}>
                  {exp.company}
                </Text>
                <Text style={{ ...dateStyle, color: colors.mutedText }}>
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </Text>
              </View>
            </View>
          )}
          {exp.description && (
            <RichContent
              content={exp.description}
              style={{
                fontSize: bodyStyle.fontSize as number,
                color: bodyStyle.color as string,
                lineHeight: bodyStyle.lineHeight as number,
              }}
            />
          )}
        </View>
      ))}
    </View>
  );
};

// ==================== EDUCATION SECTION ====================

interface EducationSectionProps {
  resume: ResumeData;
  template: TemplateDefinition;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  resume,
  template,
}) => {
  if (!resume.education || resume.education.length === 0) return null;

  const { typography, colors, layout, sections } = template;
  const itemTitleStyle = typographyToPDFStyle(
    typography.itemTitle,
    typography.baseFontFamily
  );
  const itemSubtitleStyle = typographyToPDFStyle(
    typography.itemSubtitle,
    typography.baseFontFamily
  );
  const dateStyle = typographyToPDFStyle(
    typography.date,
    typography.baseFontFamily
  );

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionHeading title="Education" template={template} />
      {resume.education.map((edu, index) => (
        <View
          key={edu.id}
          wrap={false}
          style={{
            marginBottom:
              index < resume.education.length - 1 ? layout.itemGap : 0,
          }}
        >
          {sections.itemHeaderLayout === "inline" ? (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flexDirection: "row" }}>
                <Text style={{ ...itemTitleStyle, color: colors.text }}>
                  {edu.degree}
                </Text>
                <Text
                  style={{
                    ...itemSubtitleStyle,
                    color: colors.mutedText,
                    marginLeft: 8,
                  }}
                >
                  at {edu.school}
                </Text>
              </View>
              <Text style={{ ...dateStyle, color: colors.mutedText }}>
                {edu.year}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={{ ...itemTitleStyle, color: colors.text }}>
                {edu.degree}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ ...itemSubtitleStyle, color: colors.mutedText }}>
                  {edu.school}
                </Text>
                <Text style={{ ...dateStyle, color: colors.mutedText }}>
                  {edu.year}
                </Text>
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

// ==================== SKILLS SECTION ====================

interface SkillsSectionProps {
  resume: ResumeData;
  template: TemplateDefinition;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  resume,
  template,
}) => {
  if (!resume.skills || resume.skills.length === 0) return null;

  const { typography, colors, layout, skills: skillsStyle } = template;
  const tagStyle = typographyToPDFStyle(
    typography.skillTag,
    typography.baseFontFamily
  );
  const bodyStyle = typographyToPDFStyle(
    typography.body,
    typography.baseFontFamily
  );

  const renderSkills = () => {
    switch (skillsStyle.display) {
      case "tags":
        return (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {resume.skills.map((skill, index) => (
              <View
                key={index}
                style={{
                  backgroundColor:
                    colors.skillTagBackground || colors.primary + "20",
                  paddingVertical: 3,
                  paddingHorizontal: 8,
                  borderRadius:
                    skillsStyle.tagShape === "pill"
                      ? 999
                      : skillsStyle.tagShape === "square"
                        ? 0
                        : 4,
                }}
              >
                <Text
                  style={{
                    ...tagStyle,
                    color: colors.skillTagText || colors.primary,
                  }}
                >
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        );

      case "inline":
        return (
          <Text style={{ ...bodyStyle, color: colors.text }}>
            {resume.skills.join(skillsStyle.separator || " • ")}
          </Text>
        );

      case "list":
        return (
          <View>
            {resume.skills.map((skill, index) => (
              <View
                key={index}
                style={{ flexDirection: "row", marginBottom: 2 }}
              >
                <Text
                  style={{ ...bodyStyle, color: colors.text, marginRight: 6 }}
                >
                  •
                </Text>
                <Text style={{ ...bodyStyle, color: colors.text }}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        );

      case "grid":
        const columns = skillsStyle.columns || 2;
        const rows: string[][] = [];
        for (let i = 0; i < resume.skills.length; i += columns) {
          rows.push(resume.skills.slice(i, i + columns));
        }
        return (
          <View>
            {rows.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{ flexDirection: "row", marginBottom: 4 }}
              >
                {row.map((skill, colIndex) => (
                  <Text
                    key={colIndex}
                    style={{
                      ...bodyStyle,
                      color: colors.text,
                      width: `${100 / columns}%`,
                    }}
                  >
                    {skill}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );

      default:
        return (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {resume.skills.map((skill, index) => (
              <View
                key={index}
                style={{
                  backgroundColor:
                    colors.skillTagBackground || colors.primary + "20",
                  paddingVertical: 3,
                  paddingHorizontal: 8,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    ...tagStyle,
                    color: colors.skillTagText || colors.primary,
                  }}
                >
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        );
    }
  };

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionHeading title="Skills" template={template} />
      {renderSkills()}
    </View>
  );
};

// ==================== LANGUAGES SECTION ====================

interface LanguagesSectionProps {
  resume: ResumeData;
  template: TemplateDefinition;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  resume,
  template,
}) => {
  if (!resume.languages || resume.languages.length === 0) return null;

  const { typography, colors, layout, languages: languagesStyle } = template;
  const bodyStyle = typographyToPDFStyle(
    typography.body,
    typography.baseFontFamily
  );

  const renderLevel = (level: string) => {
    if (!languagesStyle.showLevel) return null;

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
        <View style={{ flexDirection: "row", marginLeft: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i <= filledDots ? colors.primary : colors.border,
                marginRight: 2,
              }}
            />
          ))}
        </View>
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
        <View
          style={{
            marginLeft: 8,
            width: 50,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
          }}
        >
          <View
            style={{
              width: `${width}%`,
              height: "100%",
              backgroundColor: colors.primary,
              borderRadius: 2,
            }}
          />
        </View>
      );
    }

    // Text style
    return (
      <Text
        style={{
          ...bodyStyle,
          color: colors.mutedText,
          fontSize: typography.body.fontSize * 0.9,
        }}
      >
        {" "}
        ({level})
      </Text>
    );
  };

  const renderLanguages = () => {
    switch (languagesStyle.display) {
      case "inline":
        return (
          <Text style={{ ...bodyStyle, color: colors.text }}>
            {resume.languages?.map((lang, index) => (
              <React.Fragment key={lang.id}>
                {lang.name}
                {languagesStyle.showLevel &&
                  languagesStyle.levelStyle === "text" &&
                  ` (${lang.level})`}
                {index < (resume.languages?.length || 0) - 1 && ", "}
              </React.Fragment>
            ))}
          </Text>
        );

      case "grid":
        return (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {resume.languages?.map((lang) => (
              <View
                key={lang.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "50%",
                  marginBottom: 4,
                }}
              >
                <Text style={{ ...bodyStyle, color: colors.text }}>
                  {lang.name}
                </Text>
                {renderLevel(lang.level)}
              </View>
            ))}
          </View>
        );

      case "list":
      default:
        return (
          <View>
            {resume.languages?.map((lang) => (
              <View
                key={lang.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={{ ...bodyStyle, color: colors.text }}>
                  {lang.name}
                </Text>
                {renderLevel(lang.level)}
              </View>
            ))}
          </View>
        );
    }
  };

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionHeading title="Languages" template={template} />
      {renderLanguages()}
    </View>
  );
};

// ==================== CUSTOM SECTION ====================

interface CustomSectionProps {
  section: CustomSectionType;
  template: TemplateDefinition;
}

export const CustomSection: React.FC<CustomSectionProps> = ({
  section,
  template,
}) => {
  if (!section.items || section.items.length === 0) return null;

  const { typography, colors, layout, sections } = template;
  const itemTitleStyle = typographyToPDFStyle(
    typography.itemTitle,
    typography.baseFontFamily
  );
  const itemSubtitleStyle = typographyToPDFStyle(
    typography.itemSubtitle,
    typography.baseFontFamily
  );
  const dateStyle = typographyToPDFStyle(
    typography.date,
    typography.baseFontFamily
  );

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionHeading title={section.title} template={template} />
      <View style={{ gap: layout.itemGap }}>
        {section.items.map((item) => (
          <View key={item.id}>
            {sections.itemHeaderLayout === "inline" ? (
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "baseline" }}
                  >
                    <Text style={{ ...itemTitleStyle, color: colors.text }}>
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text
                        style={{
                          ...itemSubtitleStyle,
                          color: colors.mutedText,
                          marginLeft: 8,
                        }}
                      >
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                  {item.date && (
                    <Text style={{ ...dateStyle, color: colors.mutedText }}>
                      {item.date}
                    </Text>
                  )}
                </View>
                {item.description && (
                  <View style={{ marginTop: 4 }}>
                    <RichContent
                      content={item.description}
                      style={{
                        fontSize: typography.body.fontSize,
                        color: colors.text,
                        lineHeight: typography.body.lineHeight,
                      }}
                    />
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Text style={{ ...itemTitleStyle, color: colors.text }}>
                  {item.title}
                </Text>
                {(item.subtitle || item.date) && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    {item.subtitle && (
                      <Text
                        style={{
                          ...itemSubtitleStyle,
                          color: colors.mutedText,
                        }}
                      >
                        {item.subtitle}
                      </Text>
                    )}
                    {item.date && (
                      <Text style={{ ...dateStyle, color: colors.mutedText }}>
                        {item.date}
                      </Text>
                    )}
                  </View>
                )}
                {item.description && (
                  <View style={{ marginTop: 4 }}>
                    <RichContent
                      content={item.description}
                      style={{
                        fontSize: typography.body.fontSize,
                        color: colors.text,
                        lineHeight: typography.body.lineHeight,
                      }}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

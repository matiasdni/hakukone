import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TabStopType,
  BorderStyle,
} from "docx";
import type { ResumeData } from "@/types";

export const generateDocx = async (data: ResumeData): Promise<Blob> => {
  const sections: Paragraph[] = [];

  // Header
  sections.push(
    new Paragraph({
      text: data.fullName,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: data.title || "",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: data.email || "", bold: true }),
        new TextRun({ text: " | " }),
        new TextRun({ text: data.phone || "", bold: true }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  const sectionHeadingBorder = {
    bottom: {
      color: "000000",
      space: 1,
      style: BorderStyle.SINGLE,
      size: 6,
    },
  };

  // Dynamic Sections based on sectionOrder
  for (const config of data.sectionOrder) {
    if (config.type === "summary" && data.summary) {
      sections.push(
        new Paragraph({
          text: "Professional Summary",
          heading: HeadingLevel.HEADING_1,
          border: sectionHeadingBorder,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({ text: data.summary.replace(/<[^>]*>?/gm, "") })
      );
    }

    if (config.type === "experience" && data.experience.length > 0) {
      sections.push(
        new Paragraph({
          text: "Experience",
          heading: HeadingLevel.HEADING_1,
          border: sectionHeadingBorder,
          spacing: { before: 200, after: 100 },
        })
      );
      for (const exp of data.experience) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.role, bold: true, size: 24 }),
              new TextRun({ text: ` | ${exp.company}`, italics: true }),
              new TextRun({
                text: `\t${exp.startDate} - ${
                  exp.current ? "Present" : exp.endDate
                }`,
                bold: true,
              }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
            spacing: { before: 100 },
          }),
          new Paragraph({
            text: exp.description.replace(/<[^>]*>?/gm, ""),
            spacing: { after: 200 },
          })
        );
      }
    }

    if (config.type === "education" && data.education.length > 0) {
      sections.push(
        new Paragraph({
          text: "Education",
          heading: HeadingLevel.HEADING_1,
          border: sectionHeadingBorder,
          spacing: { before: 200, after: 100 },
        })
      );
      for (const edu of data.education) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.school, bold: true }),
              new TextRun({ text: `\t${edu.year}`, bold: true }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
            spacing: { before: 100 },
          }),
          new Paragraph({ text: edu.degree, spacing: { after: 100 } })
        );
      }
    }

    if (config.type === "skills" && data.skills.length > 0) {
      sections.push(
        new Paragraph({
          text: "Skills",
          heading: HeadingLevel.HEADING_1,
          border: sectionHeadingBorder,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({ text: data.skills.join(", ") })
      );
    }

    if (
      config.type === "certifications" &&
      data.certifications &&
      data.certifications.length > 0
    ) {
      sections.push(
        new Paragraph({
          text: "Certifications",
          heading: HeadingLevel.HEADING_1,
          border: sectionHeadingBorder,
          spacing: { before: 200, after: 100 },
        })
      );
      for (const cert of data.certifications) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: cert.name, bold: true }),
              new TextRun({ text: ` - ${cert.issuer}` }),
              new TextRun({ text: `\t${cert.date}`, italics: true }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
            spacing: { before: 50, after: 50 },
          })
        );
      }
    }

    if (
      config.type === "languages" &&
      data.languages &&
      data.languages.length > 0
    ) {
      sections.push(
        new Paragraph({
          text: "Languages",
          heading: HeadingLevel.HEADING_1,
          border: sectionHeadingBorder,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: data.languages.map((l) => `${l.name} (${l.level})`).join(", "),
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

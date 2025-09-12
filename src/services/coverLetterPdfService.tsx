"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CoverLetter } from "@/types";

// Helper to strip HTML and convert to plain text
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
};

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1f2937",
    backgroundColor: "#ffffff",
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
  },
  date: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 20,
  },
  recipient: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  jobTitle: {
    fontSize: 11,
    color: "#4b5563",
    marginTop: 2,
  },
  content: {
    fontSize: 11,
    color: "#374151",
    lineHeight: 1.7,
    textAlign: "justify",
  },
  paragraph: {
    marginBottom: 12,
  },
});

interface CoverLetterPDFProps {
  data: CoverLetter;
}

export const CoverLetterPDFDocument: React.FC<CoverLetterPDFProps> = ({
  data,
}) => {
  const content = stripHtml(data.content);
  const paragraphs = content.split("\n\n").filter((p) => p.trim());
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document
      title={`Cover Letter - ${data.company}`}
      author=""
      subject={`Application for ${data.jobTitle} at ${data.company}`}
      creator="Hakukone CV Builder"
    >
      <Page size="A4" style={styles.page}>
        {/* Date */}
        <View style={styles.header}>
          <Text style={styles.date}>{today}</Text>
        </View>

        {/* Recipient */}
        <View style={styles.recipient}>
          <Text style={styles.companyName}>{data.company}</Text>
          <Text style={styles.jobTitle}>RE: {data.jobTitle}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

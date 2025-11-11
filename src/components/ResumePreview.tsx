"use client";

import { TemplateRenderer } from "@/lib/templates/renderers/html";
import type { TemplateOverrides } from "@/lib/templates/types";
import type { ResumeData } from "@/types";
import { memo } from "react";

interface ResumePreviewProps {
  data: ResumeData;
  overrides?: TemplateOverrides | null;
  scale?: number;
}

/**
 * ResumePreview - A4 resume preview wrapper
 *
 * This component wraps the TemplateRenderer to provide:
 * - A4 sizing (210mm x 297mm)
 * - Optional scaling for previews
 * - Drop shadow and print-ready styling
 *
 * All template logic is handled by TemplateRenderer which uses
 * resolveTemplate() to merge base templates with user overrides.
 */
export const ResumePreview = memo(function ResumePreview({
  data,
  overrides,
  scale = 1,
}: ResumePreviewProps) {
  const templateId = data.templateId || "modern";

  // Convert null to undefined for TemplateRenderer
  const resolvedOverrides = overrides ?? undefined;

  // A4 dimensions: 210mm x 297mm
  // At 96 DPI: 794px x 1123px
  const containerStyle: React.CSSProperties = {
    width: "210mm",
    minHeight: "297mm",
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: "top center",
  };

  return (
    <div
      id="resume-preview"
      className="mx-auto bg-white shadow-lg transition-all duration-300"
      style={containerStyle}
    >
      <TemplateRenderer
        resume={data}
        templateId={templateId}
        overrides={resolvedOverrides}
      />
    </div>
  );
});

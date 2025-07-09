"use client";

import { Button } from "@/components/ui/Button";
import type { TemplateOverrides } from "@/lib/templates/types";
import type { ResumeData } from "@/types";
import { FileDown, Loader2 } from "lucide-react";
import React, {
    useCallback,
    useState,
} from "react";

interface PDFDownloadButtonProps {
  data: ResumeData;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  /** Template overrides for customization */
  overrides?: TemplateOverrides;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  data,
  variant = "secondary",
  className,
  overrides,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate filename from name
  const getFileName = useCallback(() => {
    const name = data.fullName?.replace(/\s+/g, "_") || "resume";
    return `${name}_CV.pdf`;
  }, [data.fullName]);

  // Single-click handler: generate and download in one action
  const handleExportPDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Dynamically import react-pdf to avoid SSR issues
      const { pdf } = await import("@react-pdf/renderer");

      // Use the template engine PDF renderer
      const { PDFTemplateRenderer } =
        await import("@/lib/templates/renderers/pdf");
      const templateId = data.templateId || "modern";
      const blob = await pdf(
        <PDFTemplateRenderer
          resume={data}
          templateId={templateId}
          overrides={overrides}
        />
      ).toBlob();

      // Create URL and trigger download immediately
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke URL after a short delay to ensure download starts
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  if (error) {
    return (
      <Button variant={variant} className={className} onClick={handleExportPDF}>
        <FileDown className="mr-2 h-4 w-4" />
        Retry PDF
      </Button>
    );
  }

  if (isGenerating) {
    return (
      <Button variant={variant} className={className} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Generating...
      </Button>
    );
  }

  return (
    <Button variant={variant} className={className} onClick={handleExportPDF}>
      <FileDown className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  );
};

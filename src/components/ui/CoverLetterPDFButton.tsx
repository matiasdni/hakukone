"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { FileDown, Loader2 } from "lucide-react";
import type { CoverLetter } from "@/types";

interface CoverLetterPDFButtonProps {
  data: CoverLetter;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

export const CoverLetterPDFButton: React.FC<CoverLetterPDFButtonProps> = ({
  data,
  variant = "secondary",
  className,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate filename
  const getFileName = useCallback(() => {
    const company = data.company?.replace(/\s+/g, "_") || "company";
    const job = data.jobTitle?.replace(/\s+/g, "_") || "position";
    return `Cover_Letter_${company}_${job}.pdf`;
  }, [data.company, data.jobTitle]);

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Dynamically import react-pdf to avoid SSR issues
      const [{ pdf }, { CoverLetterPDFDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/services/coverLetterPdfService"),
      ]);

      // Generate the PDF blob
      const blob = await pdf(<CoverLetterPDFDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);

      // Revoke old URL if exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(url);
      setIsReady(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = getFileName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <Button
        variant={variant}
        className={className}
        onClick={handleGeneratePDF}
      >
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

  if (isReady && pdfUrl) {
    return (
      <Button variant={variant} className={className} onClick={handleDownload}>
        <FileDown className="mr-2 h-4 w-4" />
        Download PDF
      </Button>
    );
  }

  return (
    <Button variant={variant} className={className} onClick={handleGeneratePDF}>
      <FileDown className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  );
};

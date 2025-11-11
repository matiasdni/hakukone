"use client";

import { Button } from "@/components/ui/Button";
import { getResumeHtml } from "@/lib/htmlUtils";
import type { TemplateOverrides } from "@/lib/templates/types";
import { useTRPC } from "@/trpc/client";
import type { ResumeData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { FileDown, Loader2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

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
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const trpc = useTRPC();
  const generatePdf = useMutation(trpc.pdf.generate.mutationOptions());

  // Generate filename from name
  const getFileName = useCallback(() => {
    const name = data.fullName?.replace(/\s+/g, "_") || "resume";
    return `${name}_CV.pdf`;
  }, [data.fullName]);

  // Single-click handler: generate and download in one action
  const handleExportPDF = async () => {
    setIsGenerating(true);

    try {
      // 1. Get HTML content from the preview
      const html = getResumeHtml();

      // 2. Send to server for PDF generation
      const result = await generatePdf.mutateAsync({ html });

      if (!result.pdfBase64) {
        throw new Error("No PDF data received");
      }

      // 3. Convert base64 to blob
      const byteCharacters = atob(result.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      // 4. Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

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

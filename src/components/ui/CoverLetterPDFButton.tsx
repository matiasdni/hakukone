"use client";

import { Button } from "@/components/ui/Button";
import { getPreviewHtml } from "@/lib/htmlUtils";
import { useTRPC } from "@/trpc/client";
import type { CoverLetter } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { FileDown, Loader2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

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
  const trpc = useTRPC();
  const generatePdf = useMutation(trpc.pdf.generate.mutationOptions());

  // Generate filename
  const getFileName = useCallback(() => {
    const company = data.company?.replace(/\s+/g, "_") || "company";
    const job = data.jobTitle?.replace(/\s+/g, "_") || "position";
    return `Cover_Letter_${company}_${job}.pdf`;
  }, [data.company, data.jobTitle]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      // 1. Get HTML content from the preview
      const html = getPreviewHtml("cover-letter-preview");

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

      toast.success("Cover letter downloaded successfully");
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
    <Button variant={variant} className={className} onClick={handleGeneratePDF}>
      <FileDown className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  );
};

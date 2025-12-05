"use client";

import type { CoverLetter } from "@/types";
import { memo } from "react";

interface CoverLetterPreviewProps {
  letter: CoverLetter | null;
  className?: string;
}

/**
 * Cover letter preview component
 * Displays the rendered cover letter with proper formatting
 */
export const CoverLetterPreview = memo(function CoverLetterPreview({
  letter,
  className,
}: CoverLetterPreviewProps) {
  if (!letter) {
    return (
      <div className={className}>
        <div className="text-muted-foreground flex min-h-[400px] items-center justify-center">
          No cover letter content
        </div>
      </div>
    );
  }

  return (
    <div className={className} data-cover-letter-preview data-preview>
      <div className="prose prose-sm min-h-[842px] max-w-none bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">{letter.title}</h1>
          {letter.company && (
            <p className="text-muted-foreground">For: {letter.company}</p>
          )}
        </div>

        {/* Content */}
        <div
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: letter.content }}
        />
      </div>
    </div>
  );
});

export default CoverLetterPreview;

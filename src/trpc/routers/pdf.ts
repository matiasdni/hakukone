import { wrapHtmlForPdf } from "@/lib/htmlUtils";
import { generatePDFBase64 } from "@/services/pdfService";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../init";
import { enforceRateLimit } from "../middleware/rateLimit";

/**
 * PDF Router - tRPC endpoints for PDF generation
 * Uses Puppeteer for HTML-to-PDF rendering
 */
export const pdfRouter = router({
  /**
   * Generate PDF from HTML content
   * Receives HTML from client, wraps it properly, and generates PDF via Puppeteer
   */
  generate: protectedProcedure
    .input(
      z.object({
        html: z.string().min(1, "HTML content is required"),
        format: z.enum(["A4", "Letter"]).optional().default("A4"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "pdf:generate");

      try {
        // Wrap HTML with proper document structure
        const fullHtml = wrapHtmlForPdf(input.html);

        // Generate PDF using Puppeteer
        const pdfBase64 = await generatePDFBase64({
          html: fullHtml,
          format: input.format,
          printBackground: true,
        });

        return {
          pdfBase64,
          success: true,
        };
      } catch (error) {
        console.error("PDF generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to generate PDF",
        });
      }
    }),
});

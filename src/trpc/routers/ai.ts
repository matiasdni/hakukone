import {
  analyzeJobPosting,
  careerStrategy,
  fastRewrite,
  generateCoverLetter,
  getMatchAnalysis,
  researchCompany,
  reviewCoverLetter,
  reviewResume,
  streamChat,
} from "@/services/geminiService";
import { z } from "zod";
import { protectedProcedure, router } from "../init";
import { enforceRateLimit } from "../middleware/rateLimit";

/**
 * AI Router - tRPC endpoints for AI-powered features
 * Uses Google Gemini for text generation and analysis
 */
export const aiRouter = router({
  /**
   * Fast text rewrite with different tones
   */
  rewrite: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        tone: z.enum(["professional", "creative", "concise"]),
        language: z.enum(["en", "fi"]).default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "ai:rewrite");
      return fastRewrite(input.text, input.tone, input.language);
    }),

  /**
   * Analyze job posting to extract keywords and requirements
   */
  analyzeJob: protectedProcedure
    .input(
      z.object({
        jobText: z.string().min(1).max(10000),
        language: z.enum(["en", "fi"]).default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "ai:analyzeJob");
      return analyzeJobPosting(input.jobText, input.language);
    }),

  /**
   * Research company using Google Search
   */
  researchCompany: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(1).max(200),
        language: z.enum(["en", "fi"]).default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "ai:research");
      return researchCompany(input.companyName, input.language);
    }),

  /**
   * Get match analysis between resume and job description
   */
  matchAnalysis: protectedProcedure
    .input(
      z.object({
        resumeText: z.string().min(1).max(20000),
        jobDescription: z.string().min(1).max(10000),
        language: z.enum(["en", "fi"]).default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "ai:matchAnalysis");
      return getMatchAnalysis(
        input.resumeText,
        input.jobDescription,
        input.language
      );
    }),

  /**
   * Review and get feedback on resume
   */
  reviewResume: protectedProcedure
    .input(
      z.object({
        resumeText: z.string().min(1).max(20000),
        language: z.enum(["en", "fi"]).default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "ai:reviewResume");
      return reviewResume(input.resumeText, input.language);
    }),

  /**
   * Generate cover letter based on resume and job
   */
  generateCoverLetter: protectedProcedure
    .input(
      z.object({
        resumeData: z.string().min(1).max(20000),
        jobDescription: z.string().min(1).max(10000),
        language: z.enum(["en", "fi"]).default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "ai:generateCoverLetter");
      return generateCoverLetter(
        input.resumeData,
        input.jobDescription,
        input.language
      );
    }),

  /**
   * Review cover letter and provide feedback
   */
  reviewCoverLetter: protectedProcedure
    .input(
      z.object({
        letterText: z.string().min(1).max(10000),
        language: z.enum(["en", "fi"]).default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "ai:reviewCoverLetter");
      return reviewCoverLetter(input.letterText, input.language);
    }),

  /**
   * Chat with AI career assistant (Streaming)
   */
  chat: protectedProcedure
    .input(
      z.object({
        history: z.array(
          z.object({
            role: z.enum(["user", "model"]),
            parts: z.array(z.object({ text: z.string() })),
          })
        ),
        message: z.string().min(1).max(5000),
        language: z.enum(["en", "fi"]).default("en"),
      })
    )
    .mutation(async function* ({ ctx, input }) {
      await enforceRateLimit(ctx.userId, "ai:chat");
      const stream = streamChat(input.history, input.message, input.language);
      for await (const chunk of stream) {
        yield chunk;
      }
    }),

  /**
   * Get career strategy advice
   */
  careerStrategy: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(5000),
        context: z.string().optional(),
        language: z.enum(["en", "fi"]).default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "ai:careerStrategy");
      return careerStrategy(input.query, input.context ?? "", input.language);
    }),
});

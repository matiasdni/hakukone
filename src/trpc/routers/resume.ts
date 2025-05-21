import { resumes } from "@/lib/db/schema";
import { appRatelimit } from "@/lib/ratelimit";
import type { ResumeData } from "@/types";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../init";

/**
 * Rate limit helper - throws tRPC error if rate limited
 */
async function enforceRateLimit(userId: string, action: string) {
  if (!appRatelimit) return;

  const result = await appRatelimit.limit(`${action}:${userId}`);
  if (!result.success) {
    const retryAfter = Math.max(
      1,
      Math.ceil((result.reset - Date.now()) / 1000)
    );
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Too many requests. Please try again in ${retryAfter} seconds.`,
    });
  }
}

/**
 * Schema for resume data
 */
const resumeSchema = z.object({
  id: z.string(),
  lastModified: z.number(),
  fullName: z.string(),
  title: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string().optional(),
  photoUrl: z.string().optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.enum([
          "linkedin",
          "github",
          "portfolio",
          "twitter",
          "other",
        ]),
        url: z.string(),
      })
    )
    .optional(),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      id: z.string(),
      role: z.string(),
      company: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      current: z.boolean(),
      description: z.string(),
    })
  ),
  education: z.array(
    z.object({
      id: z.string(),
      degree: z.string(),
      school: z.string(),
      year: z.string(),
    })
  ),
  certifications: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        issuer: z.string(),
        date: z.string(),
      })
    )
    .optional(),
  languages: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        level: z.enum([
          "Native",
          "Fluent",
          "Proficient",
          "Intermediate",
          "Basic",
        ]),
      })
    )
    .optional(),
  customSections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          subtitle: z.string(),
          date: z.string(),
          description: z.string(),
        })
      ),
    })
  ),
  sectionOrder: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "summary",
        "experience",
        "education",
        "skills",
        "certifications",
        "languages",
        "custom",
      ]),
      name: z.string().optional(),
    })
  ),
  templateId: z.string().optional(),
  theme: z
    .object({
      primaryColor: z.string(),
      fontFamily: z.enum(["sans", "serif", "mono"]),
    })
    .optional(),
  linkedJobId: z.string().optional(),
});

export const resumeRouter = router({
  /**
   * Get all active resumes for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const rows = await ctx.db
        .select({ data: resumes.data, isArchived: resumes.isArchived })
        .from(resumes)
        .where(eq(resumes.userId, ctx.userId));

      const active = rows
        .filter((row) => !row.isArchived)
        .map((row) => row.data);
      return active as ResumeData[];
    } catch (error) {
      console.error("Database error fetching resumes:", error);
      // Return empty array if table doesn't exist or other DB errors
      return [] as ResumeData[];
    }
  }),

  /**
   * Get a single resume by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const row = await ctx.db.query.resumes.findFirst({
          where: (table, { and: andWhere, eq: equals }) =>
            andWhere(
              equals(table.id, input.id),
              equals(table.userId, ctx.userId)
            ),
        });

        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Resume not found",
          });
        }

        return row.data as ResumeData;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Database error fetching resume:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch resume",
        });
      }
    }),

  /**
   * Create or update a resume
   */
  upsert: protectedProcedure
    .input(z.object({ resume: resumeSchema }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "resume:write");

      const resume = input.resume;

      try {
        await ctx.db
          .insert(resumes)
          .values({
            id: resume.id,
            userId: ctx.userId,
            data: resume,
            templateId: resume.templateId || "modern",
            linkedJobId: resume.linkedJobId || null,
          })
          .onConflictDoUpdate({
            target: resumes.id,
            set: {
              data: resume,
              templateId: resume.templateId || "modern",
              linkedJobId: resume.linkedJobId || null,
              updatedAt: new Date(),
            },
          });

        return { success: true };
      } catch (error) {
        console.error("Database error upserting resume:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save resume",
        });
      }
    }),

  /**
   * Archive (soft delete) a resume
   */
  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "resume:delete");

      await ctx.db
        .update(resumes)
        .set({ isArchived: true })
        .where(and(eq(resumes.id, input.id), eq(resumes.userId, ctx.userId)));

      return { success: true };
    }),

  /**
   * Permanently delete a resume
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "resume:delete");

      await ctx.db
        .delete(resumes)
        .where(and(eq(resumes.id, input.id), eq(resumes.userId, ctx.userId)));

      return { success: true };
    }),
});

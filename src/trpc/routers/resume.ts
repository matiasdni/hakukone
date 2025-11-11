import { resumes } from "@/lib/db/schema";
import type { ResumeData } from "@/types";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../init";
import { enforceRateLimit } from "../middleware/rateLimit";

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
   * Create a new resume - PostgreSQL generates ID
   * Use this for creating new resumes (more secure than upsert)
   */
  create: protectedProcedure
    .input(
      z.object({
        data: resumeSchema.omit({ id: true }), // Don't accept ID from client
        templateId: z.string().default("modern"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "resume:write");

      try {
        // Let PostgreSQL generate the UUID via gen_random_uuid()
        const [inserted] = await ctx.db
          .insert(resumes)
          .values({
            // id omitted - DB generates via gen_random_uuid()
            userId: ctx.userId,
            data: {
              ...input.data,
              id: "", // Placeholder, will be updated below
              lastModified: Date.now(),
            },
            templateId: input.templateId,
            linkedJobId: input.data.linkedJobId || null,
          })
          .returning({ id: resumes.id });

        // Update the resume data with the DB-generated ID
        await ctx.db
          .update(resumes)
          .set({
            data: {
              ...input.data,
              id: inserted.id,
              lastModified: Date.now(),
            },
          })
          .where(eq(resumes.id, inserted.id));

        // Return ID so client can navigate to it
        return { id: inserted.id, success: true };
      } catch (error) {
        console.error("Database error creating resume:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create resume",
        });
      }
    }),

  /**
   * Create or update a resume (with ownership verification)
   * For updates: verifies the user owns the resume before modifying
   */
  upsert: protectedProcedure
    .input(z.object({ resume: resumeSchema }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "resume:write");

      const resume = input.resume;

      try {
        // Check if resume exists
        const existing = await ctx.db.query.resumes.findFirst({
          where: eq(resumes.id, resume.id),
          columns: { userId: true },
        });

        if (existing) {
          // UPDATE path - verify ownership first
          if (existing.userId !== ctx.userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not have permission to modify this resume",
            });
          }

          // Safe to update - user owns this resume
          await ctx.db
            .update(resumes)
            .set({
              data: resume,
              templateId: resume.templateId || "modern",
              linkedJobId: resume.linkedJobId || null,
              updatedAt: new Date(),
            })
            .where(
              and(eq(resumes.id, resume.id), eq(resumes.userId, ctx.userId))
            );
        } else {
          // INSERT path - new resume
          await ctx.db.insert(resumes).values({
            id: resume.id,
            userId: ctx.userId,
            data: resume,
            templateId: resume.templateId || "modern",
            linkedJobId: resume.linkedJobId || null,
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
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

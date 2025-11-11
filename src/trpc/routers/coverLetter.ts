import { coverLetters } from "@/lib/db/schema";
import type { CoverLetter } from "@/types";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../init";
import { enforceRateLimit } from "../middleware/rateLimit";

export const coverLetterRouter = router({
  /**
   * Get a cover letter by ID - only returns if user owns it
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.coverLetters.findFirst({
        where: (table, { and: andWhere, eq: equals }) =>
          andWhere(
            equals(table.id, input.id),
            equals(table.userId, ctx.userId)
          ),
      });

      return row ? (row.data as CoverLetter) : null;
    }),

  /**
   * Create a new cover letter - PostgreSQL generates ID via gen_random_uuid()
   * Single query: insert with DB-generated UUID, return the ID
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().default("Untitled"),
        company: z.string().default(""),
        jobTitle: z.string().default(""),
        content: z.string().default(""),
        linkedResumeId: z.string().optional(),
        linkedJobId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "coverLetter:create");

      // Single query: PostgreSQL generates UUID, we return it
      // The data.id will be synced by the client using the returned id
      const [inserted] = await ctx.db
        .insert(coverLetters)
        .values({
          // id omitted - DB generates via gen_random_uuid()
          userId: ctx.userId,
          data: {
            id: "", // Will be set by client after receiving the response
            title: input.title,
            company: input.company,
            jobTitle: input.jobTitle,
            content: input.content,
            lastModified: Date.now(),
            linkedResumeId: input.linkedResumeId,
            linkedJobId: input.linkedJobId,
          },
          linkedResumeId: input.linkedResumeId ?? null,
          linkedJobId: input.linkedJobId ?? null,
          isArchived: false,
        })
        .returning({ id: coverLetters.id });

      return { id: inserted.id, success: true };
    }),

  /**
   * Create or update a cover letter (with ownership verification)
   */
  upsert: protectedProcedure
    .input(z.object({ coverLetter: z.custom<CoverLetter>() }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "coverLetter:upsert");

      const { coverLetter } = input;

      // Check if cover letter exists
      const existing = await ctx.db.query.coverLetters.findFirst({
        where: eq(coverLetters.id, coverLetter.id),
        columns: { userId: true },
      });

      if (existing) {
        // UPDATE path - verify ownership first
        if (existing.userId !== ctx.userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to modify this cover letter",
          });
        }

        // Safe to update
        await ctx.db
          .update(coverLetters)
          .set({
            data: coverLetter,
            linkedResumeId: coverLetter.linkedResumeId ?? null,
            linkedJobId: coverLetter.linkedJobId ?? null,
          })
          .where(
            and(
              eq(coverLetters.id, coverLetter.id),
              eq(coverLetters.userId, ctx.userId)
            )
          );
      } else {
        // INSERT path - new cover letter
        await ctx.db.insert(coverLetters).values({
          id: coverLetter.id,
          userId: ctx.userId,
          data: coverLetter,
          linkedResumeId: coverLetter.linkedResumeId ?? null,
          linkedJobId: coverLetter.linkedJobId ?? null,
          isArchived: false,
        });
      }

      return { success: true };
    }),
});

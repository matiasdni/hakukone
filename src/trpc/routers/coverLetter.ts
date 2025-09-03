import { coverLetters } from "@/lib/db/schema";
import type { CoverLetter } from "@/types";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../init";

export const coverLetterRouter = router({
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const rows = await ctx.db
      .select({ data: coverLetters.data })
      .from(coverLetters)
      .where(eq(coverLetters.id, input.id));

    const row = rows[0];
    return row ? (row.data as CoverLetter) : null;
  }),

  upsert: protectedProcedure
    .input(z.object({ coverLetter: z.custom<CoverLetter>() }))
    .mutation(async ({ ctx, input }) => {
      const { coverLetter } = input;

      await ctx.db
        .insert(coverLetters)
        .values({
          id: coverLetter.id,
          userId: ctx.userId,
          data: coverLetter,
          linkedResumeId: coverLetter.linkedResumeId ?? null,
          linkedJobId: coverLetter.linkedJobId ?? null,
          isArchived: coverLetter.isArchived ?? false,
        })
        .onConflictDoUpdate({
          target: coverLetters.id,
          set: {
            data: coverLetter,
            linkedResumeId: coverLetter.linkedResumeId ?? null,
            linkedJobId: coverLetter.linkedJobId ?? null,
            isArchived: coverLetter.isArchived ?? false,
          },
        });

      return { success: true };
    }),
});

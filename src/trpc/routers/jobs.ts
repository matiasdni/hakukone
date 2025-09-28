import { jobs } from "@/lib/db/schema";
import { appRatelimit } from "@/lib/ratelimit";
import type { JobApplication } from "@/types";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../init";

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

const jobSchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  description: z.string().optional(),
  status: z.enum(["Saved", "Applying", "Interview", "Offer"]),
  dateAdded: z.number(),
});

export const jobsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const rows = await ctx.db
        .select({ data: jobs.data })
        .from(jobs)
        .where(eq(jobs.userId, ctx.userId));

      return rows.map((r) => r.data as JobApplication);
    } catch (error) {
      console.error("Database error fetching jobs:", error);
      return [] as JobApplication[];
    }
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const row = await ctx.db.query.jobs.findFirst({
          where: (table, { and: andWhere, eq: equals }) =>
            andWhere(equals(table.id, input.id), equals(table.userId, ctx.userId)),
        });

        if (!row) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        return row.data as JobApplication;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Database error fetching job:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch job" });
      }
    }),

  upsert: protectedProcedure
    .input(z.object({ job: jobSchema }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "jobs:write");

      const job = input.job;

      await ctx.db
        .insert(jobs)
        .values({ id: job.id, userId: ctx.userId, data: job })
        .onConflictDoUpdate({
          target: jobs.id,
          set: { data: job },
        });

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "jobs:delete");

      await ctx.db.delete(jobs).where(and(eq(jobs.id, input.id), eq(jobs.userId, ctx.userId)));

      return { success: true };
    }),
});

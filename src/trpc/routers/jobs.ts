import { jobs } from "@/lib/db/schema";
import type { JobApplication } from "@/types";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../init";
import { enforceRateLimit } from "../middleware/rateLimit";

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
            andWhere(
              equals(table.id, input.id),
              equals(table.userId, ctx.userId)
            ),
        });

        if (!row) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        return row.data as JobApplication;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Database error fetching job:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch job",
        });
      }
    }),

  /**
   * Create a new job - PostgreSQL generates ID via gen_random_uuid()
   * Single query: insert with DB-generated UUID, return the ID
   */
  create: protectedProcedure
    .input(
      z.object({
        role: z.string(),
        company: z.string(),
        description: z.string().optional(),
        status: z
          .enum(["Saved", "Applying", "Interview", "Offer"])
          .default("Saved"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "jobs:create");

      // Single query: PostgreSQL generates UUID, we return it
      const [inserted] = await ctx.db
        .insert(jobs)
        .values({
          // id omitted - DB generates via gen_random_uuid()
          userId: ctx.userId,
          data: {
            id: "", // Will be set by client after receiving the response
            ...input,
            dateAdded: Date.now(),
          },
        })
        .returning({ id: jobs.id });

      return { id: inserted.id, success: true };
    }),

  /**
   * Create or update a job (with ownership verification)
   */
  upsert: protectedProcedure
    .input(z.object({ job: jobSchema }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "jobs:upsert");

      const job = input.job;

      // Check if job exists
      const existing = await ctx.db.query.jobs.findFirst({
        where: eq(jobs.id, job.id),
        columns: { userId: true },
      });

      if (existing) {
        // UPDATE path - verify ownership first
        if (existing.userId !== ctx.userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to modify this job",
          });
        }

        // Safe to update
        await ctx.db
          .update(jobs)
          .set({ data: job })
          .where(and(eq(jobs.id, job.id), eq(jobs.userId, ctx.userId)));
      } else {
        // INSERT path - new job
        await ctx.db.insert(jobs).values({
          id: job.id,
          userId: ctx.userId,
          data: job,
        });
      }

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "jobs:delete");

      await ctx.db
        .delete(jobs)
        .where(and(eq(jobs.id, input.id), eq(jobs.userId, ctx.userId)));

      return { success: true };
    }),
});

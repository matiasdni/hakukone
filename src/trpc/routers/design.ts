import { designOverrides } from "@/lib/db/schema";
import { appRatelimit } from "@/lib/ratelimit";
import type { TemplateOverrides } from "@/lib/templates/types";
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
 * Schema for template overrides (partial - allows any valid override)
 */
const templateOverridesSchema = z.custom<TemplateOverrides>();

export const designRouter = router({
  /**
   * Get design overrides for a resume
   */
  get: protectedProcedure
    .input(z.object({ resumeId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const row = await ctx.db.query.designOverrides.findFirst({
          where: (table, { and: andWhere, eq: equals }) =>
            andWhere(
              equals(table.resumeId, input.resumeId),
              equals(table.userId, ctx.userId)
            ),
        });

        return {
          overrides: (row?.overrides ?? null) as TemplateOverrides | null,
          templateId: row?.templateId ?? "modern",
        };
      } catch (error) {
        console.error("Database error fetching design overrides:", error);
        return {
          overrides: null,
          templateId: "modern",
        };
      }
    }),

  /**
   * Save design overrides for a resume
   */
  save: protectedProcedure
    .input(
      z.object({
        resumeId: z.string(),
        templateId: z.string().default("modern"),
        overrides: templateOverridesSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "design-overrides");

      const { resumeId, templateId, overrides } = input;

      await ctx.db
        .insert(designOverrides)
        .values({
          id: `${resumeId}:${templateId}`,
          resumeId,
          userId: ctx.userId,
          templateId,
          overrides,
        })
        .onConflictDoUpdate({
          target: designOverrides.id,
          set: { templateId, overrides },
        });

      return { success: true };
    }),

  /**
   * Delete design overrides for a resume
   */
  delete: protectedProcedure
    .input(z.object({ resumeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit(ctx.userId, "design-overrides");

      await ctx.db
        .delete(designOverrides)
        .where(
          and(
            eq(designOverrides.resumeId, input.resumeId),
            eq(designOverrides.userId, ctx.userId)
          )
        );

      return { success: true };
    }),
});

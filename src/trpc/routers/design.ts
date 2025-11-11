import { designOverrides } from "@/lib/db/schema";
import type { TemplateOverrides } from "@/lib/templates/types";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../init";
import { enforceRateLimit } from "../middleware/rateLimit";

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

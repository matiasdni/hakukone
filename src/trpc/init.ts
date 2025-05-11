import { stackServerApp } from "@/app/stack/server";
import { db } from "@/lib/db/client";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

/**
 * Context for tRPC procedures
 */
export interface TRPCContext {
  db: typeof db;
  userId: string | null;
}

/**
 * Creates the context for tRPC procedures
 * Used for both App Router API routes and server actions
 * 
 * With Neon Auth enabled, user data is automatically synced to
 * the neon_auth.users_sync table - no manual sync needed!
 */
export async function createTRPCContext(): Promise<TRPCContext> {
  const stackUser = await stackServerApp.getUser();
  
  return {
    db,
    userId: stackUser?.id ?? null,
  };
}

/**
 * Initialize tRPC with superjson for serialization
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller factory
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Export router and procedure helpers
 */
export const router = t.router;

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 * Throws UNAUTHORIZED if user is not logged in
 */
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;

  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      // Infers that userId is non-nullable
      userId: ctx.userId,
    },
  });
});

import "server-only";

import { cache } from "react";
import { createCallerFactory, createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

/**
 * Create a stable getter for the query client
 * Returns the same client during the same request
 */
export const getQueryClient = cache(makeQueryClient);

/**
 * Create a caller factory for server-side calls
 */
const createCaller = createCallerFactory(appRouter);

/**
 * Server-side tRPC caller
 * Use this to call tRPC procedures directly in Server Components
 */
export const caller = async () => {
  const ctx = await createTRPCContext();
  return createCaller(ctx);
};

/**
 * Pre-made tRPC context for use in server actions
 */
export async function createActionContext() {
  return createTRPCContext();
}

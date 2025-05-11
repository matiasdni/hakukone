"use client";

import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "./routers/_app";

/**
 * tRPC React hooks and provider
 * Creates typed hooks for client-side data fetching
 */
export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

import { appRatelimit } from "@/lib/ratelimit";
import { TRPCError } from "@trpc/server";

/**
 * Rate limit enforcement helper for tRPC procedures
 * Uses Upstash Redis sliding window rate limiting
 *
 * @param userId - User ID to rate limit against
 * @param action - Action name for rate limit grouping (e.g., "ai:rewrite", "resume:create")
 * @throws TRPCError with TOO_MANY_REQUESTS code if rate limited
 */
export async function enforceRateLimit(
  userId: string,
  action: string
): Promise<void> {
  // Skip rate limiting if Redis is not configured (local development)
  if (!appRatelimit) {
    return;
  }

  const result = await appRatelimit.limit(`${action}:${userId}`);

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limited. Try again in ${retryAfter}s`,
    });
  }
}

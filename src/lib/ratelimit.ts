import { getRedisClient } from "@/lib/redis/client";
import { Ratelimit } from "@upstash/ratelimit";

const redis = getRedisClient();

/**
 * Global sliding window rate limit for mutating endpoints.
 * Falls back to undefined when Redis is not configured, so callers
 * can skip enforcement in local development.
 */
export const appRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true
    })
  : null;

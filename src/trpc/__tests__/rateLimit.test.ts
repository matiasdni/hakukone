import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { enforceRateLimit } from "../middleware/rateLimit";

// Mock the ratelimit library
const mockLimit = vi.fn();
vi.mock("@/lib/ratelimit", () => ({
  appRatelimit: {
    limit: (...args: unknown[]) => mockLimit(...args),
  },
}));

describe("Rate Limit Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow request when within limit", async () => {
    // Setup mock to return success
    mockLimit.mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 10000,
    });

    // Should not throw
    await expect(
      enforceRateLimit("user-123", "test:action")
    ).resolves.not.toThrow();

    // Verify correct key format
    expect(mockLimit).toHaveBeenCalledWith("test:action:user-123");
  });

  it("should throw TRPCError when rate limited", async () => {
    // Setup mock to return failure
    const resetTime = Date.now() + 5000;
    mockLimit.mockResolvedValue({
      success: false,
      limit: 10,
      remaining: 0,
      reset: resetTime,
    });

    // Should throw TOO_MANY_REQUESTS
    await expect(enforceRateLimit("user-123", "test:action")).rejects.toThrow(
      TRPCError
    );

    try {
      await enforceRateLimit("user-123", "test:action");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      if (error instanceof TRPCError) {
        expect(error.code).toBe("TOO_MANY_REQUESTS");
        expect(error.message).toContain("Rate limited");
      }
    }
  });

  it("should handle missing ratelimiter (e.g. local dev without Redis)", async () => {
    vi.resetModules();
    // Mock the module to return null for appRatelimit
    vi.doMock("@/lib/ratelimit", () => ({
      appRatelimit: null,
    }));

    // Re-import to get the mocked null value
    const { enforceRateLimit: enforceRateLimitNoRedis } =
      await import("../middleware/rateLimit");

    // Should not throw
    await expect(
      enforceRateLimitNoRedis("user-123", "test:action")
    ).resolves.not.toThrow();

    vi.doUnmock("@/lib/ratelimit");
  });
});

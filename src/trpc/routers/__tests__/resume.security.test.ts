/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment node
import { db } from "@/lib/db/client";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resumeRouter } from "../resume";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock database
vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    query: {
      resumes: {
        findFirst: vi.fn(),
      },
    },
  },
}));

// Mock rate limiter
vi.mock("@/trpc/middleware/rateLimit", () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(undefined),
}));

describe("Resume Router Security", () => {
  const mockCtx = {
    userId: "user-123",
    session: {
      user: { id: "user-123" },
    },
    db: db as any,
  };

  const validResumeData = {
    id: "resume-123",
    lastModified: Date.now(),
    fullName: "John Doe",
    title: "Software Engineer",
    email: "john@example.com",
    phone: "123-456-7890",
    summary: "Experienced developer",
    skills: ["TypeScript", "React"],
    experience: [],
    education: [],
    customSections: [],
    sectionOrder: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("should return resume if owned by user", async () => {
      const mockDbResume = {
        id: "resume-123",
        userId: "user-123",
        data: validResumeData,
      };

      (db.query.resumes.findFirst as any).mockResolvedValue(mockDbResume);

      const caller = resumeRouter.createCaller(mockCtx);
      const result = await caller.getById({ id: "resume-123" });

      expect(result).toEqual(validResumeData);
    });

    it("should throw NOT_FOUND if resume does not exist or not owned by user", async () => {
      (db.query.resumes.findFirst as any).mockResolvedValue(null);

      const caller = resumeRouter.createCaller(mockCtx);

      await expect(caller.getById({ id: "resume-123" })).rejects.toThrow(
        TRPCError
      );
    });
  });

  describe("upsert", () => {
    it("should throw FORBIDDEN if trying to update another user's resume", async () => {
      const mockDbResume = {
        id: "resume-123",
        userId: "other-user",
        data: validResumeData,
      };

      (db.query.resumes.findFirst as any).mockResolvedValue(mockDbResume);

      const caller = resumeRouter.createCaller(mockCtx);

      await expect(
        caller.upsert({
          resume: validResumeData,
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("list", () => {
    it("should only return resumes owned by the user", async () => {
      const mockResumes = [
        { id: "1", userId: "user-123", data: {}, isArchived: false },
        { id: "2", userId: "user-123", data: {}, isArchived: false },
      ];

      const mockWhere = vi.fn().mockResolvedValue(mockResumes);
      const mockFrom = vi.fn(() => ({ where: mockWhere }));
      const mockSelect = vi.fn(() => ({ from: mockFrom }));
      (db.select as any).mockImplementation(mockSelect);

      const caller = resumeRouter.createCaller(mockCtx);
      const result = await caller.list();

      expect(result).toHaveLength(2);
      expect(db.select).toHaveBeenCalled();
    });
  });
});

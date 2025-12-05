// @vitest-environment node
import { db } from "@/lib/db/client";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resumeRouter } from "../resume";

// Mock server-only to prevent import errors
vi.mock("server-only", () => ({}));

// Mock the database client
vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(),
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

describe("Resume Router Integration", () => {
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

  describe("create", () => {
    it("should create a resume and return the ID", async () => {
      const mockDbResume = {
        id: "resume-123",
        userId: "user-123",
        data: validResumeData,
        templateId: "modern",
      };

      // Setup mock chain for insert
      const mockReturning = vi.fn().mockResolvedValue([mockDbResume]);
      const mockValues = vi.fn(() => ({ returning: mockReturning }));
      const mockInsert = vi.fn(() => ({ values: mockValues }));
      (db.insert as any).mockImplementation(mockInsert);

      const caller = resumeRouter.createCaller(mockCtx);
      const result = await caller.create({
        data: validResumeData,
        templateId: "modern",
      });

      expect(result).toEqual({ id: "resume-123", success: true });
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("upsert", () => {
    it("should update existing resume if user owns it", async () => {
      const mockDbResume = {
        id: "resume-123",
        userId: "user-123",
        data: validResumeData,
      };

      // Mock finding existing resume
      (db.query.resumes.findFirst as any).mockResolvedValue(mockDbResume);

      // Mock update
      const mockReturning = vi.fn().mockResolvedValue([mockDbResume]);
      const mockWhereUpdate = vi.fn(() => ({ returning: mockReturning }));
      const mockSet = vi.fn(() => ({ where: mockWhereUpdate }));
      const mockUpdate = vi.fn(() => ({ set: mockSet }));
      (db.update as any).mockImplementation(mockUpdate);

      const caller = resumeRouter.createCaller(mockCtx);
      const result = await caller.upsert({
        resume: validResumeData,
      });

      expect(result).toEqual({ success: true });
    });

    it("should throw FORBIDDEN if user does not own resume", async () => {
      const mockDbResume = {
        id: "resume-123",
        userId: "other-user", // Different user
        data: validResumeData,
      };

      // Mock finding existing resume
      (db.query.resumes.findFirst as any).mockResolvedValue(mockDbResume);

      const caller = resumeRouter.createCaller(mockCtx);

      await expect(
        caller.upsert({
          resume: validResumeData,
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});

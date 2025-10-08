import { stackServerApp } from "@/app/stack/server";
import { db } from "@/lib/db/client";
import { resumes, users } from "@/lib/db/schema";
import { appRatelimit } from "@/lib/ratelimit";
import type { ResumeData } from "@/types";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const payloadSchema = z.object({
  resume: z.custom<ResumeData>(),
});

async function enforceRateLimit(userId: string, action: string) {
  if (!appRatelimit) return null;
  const result = await appRatelimit.limit(`${action}:${userId}`);
  if (!result.success) {
    const retryAfter = Math.max(
      1,
      Math.ceil((result.reset - Date.now()) / 1000)
    );
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": retryAfter.toString() },
      }
    );
  }
  return null;
}

// Helper to ensure user exists in database
async function ensureUserExists(userId: string, email?: string | null, name?: string | null) {
  await db
    .insert(users)
    .values({
      id: userId,
      email: email || "unknown@example.com",
      name: name || null,
    })
    .onConflictDoNothing();
}

export async function GET() {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await db
      .select({ data: resumes.data, isArchived: resumes.isArchived })
      .from(resumes)
      .where(eq(resumes.userId, user.id));

    const active = rows.filter((row) => !row.isArchived).map((row) => row.data);
    return NextResponse.json(active);
  } catch (error) {
    console.error("Database error fetching resumes:", error);
    // Return empty array if table doesn't exist or other DB errors
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rateLimitResponse = await enforceRateLimit(user.id, "resume:write");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const resume = parsed.data.resume;

    // Ensure user exists in database first (for foreign key)
    await ensureUserExists(user.id, user.primaryEmail, user.displayName);

    await db
      .insert(resumes)
      .values({
        id: resume.id,
        userId: user.id,
        data: resume,
        templateId: resume.templateId || "modern",
        linkedJobId: resume.linkedJobId || null,
      })
      .onConflictDoUpdate({
        target: resumes.id,
        set: {
          data: resume,
          templateId: resume.templateId || "modern",
          linkedJobId: resume.linkedJobId || null,
        },
      });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save resume:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save resume",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rateLimitResponse = await enforceRateLimit(user.id, "resume:delete");
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db
    .update(resumes)
    .set({ isArchived: true })
    .where(and(eq(resumes.id, id), eq(resumes.userId, user.id)));

  return NextResponse.json({ ok: true });
}

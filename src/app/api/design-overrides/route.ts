import { stackServerApp } from "@/app/stack/server";
import { db } from "@/lib/db/client";
import { designOverrides, resumes, users } from "@/lib/db/schema";
import { appRatelimit } from "@/lib/ratelimit";
import type { TemplateOverrides } from "@/lib/templates/types";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const payloadSchema = z.object({
  resumeId: z.string(),
  templateId: z.string().default("modern"),
  overrides: z.custom<TemplateOverrides>(),
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
async function ensureUserExists(userId: string, email: string, name: string | null) {
  await db
    .insert(users)
    .values({
      id: userId,
      email: email || "unknown@example.com",
      name: name,
    })
    .onConflictDoNothing();
}

export async function GET(request: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get("resumeId");
  if (!resumeId) {
    return NextResponse.json(
      { error: "resumeId is required" },
      { status: 400 }
    );
  }

  const row = await db.query.designOverrides.findFirst({
    where: (table, { and: andWhere, eq: equals }) =>
      andWhere(equals(table.resumeId, resumeId), equals(table.userId, user.id)),
  });

  return NextResponse.json({
    overrides: row?.overrides ?? null,
    templateId: row?.templateId ?? "modern",
  });
}

export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rateLimitResponse = await enforceRateLimit(user.id, "design-overrides");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { resumeId, templateId, overrides } = parsed.data;

    // Ensure user exists in database first (for foreign key)
    await ensureUserExists(user.id, user.primaryEmail || "", user.displayName);

    // Check if the resume exists before trying to save design overrides
    const existingResume = await db.query.resumes.findFirst({
      where: eq(resumes.id, resumeId),
    });

    if (!existingResume) {
      // Resume doesn't exist yet - this is OK for client-side only resumes
      // Just return success without persisting to avoid FK constraint error
      console.log(`Resume ${resumeId} not found in DB, skipping design override persistence`);
      return NextResponse.json({ ok: true, persisted: false });
    }

    await db
      .insert(designOverrides)
      .values({
        id: `${resumeId}:${templateId}`,
        resumeId,
        userId: user.id,
        templateId,
        overrides,
      })
      .onConflictDoUpdate({
        target: designOverrides.id,
        set: { templateId, overrides },
      });

    return NextResponse.json({ ok: true, persisted: true });
  } catch (error) {
    console.error("Failed to save design overrides:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save design overrides",
      },
      { status: 500 }
    );
  }
}

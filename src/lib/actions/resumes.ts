"use server";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { designOverrides, resumes } from "@/lib/db/schema";
import type { TemplateOverrides } from "@/lib/templates/types";
import type { ResumeData } from "@/types";
import { and, eq } from "drizzle-orm";

export async function listResumes(): Promise<ResumeData[]> {
  const userId = await requireUserId();
  const rows = await db
    .select({
      data: resumes.data,
      isArchived: resumes.isArchived,
    })
    .from(resumes)
    .where(eq(resumes.userId, userId));
  return rows.filter((row) => !row.isArchived).map((row) => row.data);
}

export async function upsertResume(resume: ResumeData) {
  const userId = await requireUserId();
  await db
    .insert(resumes)
    .values({
      id: resume.id,
      userId,
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
}

export async function archiveResume(resumeId: string) {
  const userId = await requireUserId();
  await db
    .update(resumes)
    .set({ isArchived: true })
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));
}

export async function upsertDesignOverrides(
  resumeId: string,
  templateId: string,
  overrides: TemplateOverrides
) {
  const userId = await requireUserId();
  await db
    .insert(designOverrides)
    .values({
      id: `${resumeId}:${templateId}`,
      resumeId,
      userId,
      templateId,
      overrides,
    })
    .onConflictDoUpdate({
      target: designOverrides.id,
      set: { templateId, overrides },
    });
}

export async function getDesignOverrides(resumeId: string) {
  const userId = await requireUserId();
  const row = await db.query.designOverrides.findFirst({
    where: (table, { and, eq: equals }) =>
      and(equals(table.resumeId, resumeId), equals(table.userId, userId)),
  });
  return row?.overrides || null;
}

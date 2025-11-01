"use client";

import type { TemplateOverrides } from "@/lib/templates/types";
import type { ResumeData } from "@/types";

/**
 * Client-side data fetching utilities
 * These call the TRPC API endpoints
 */

/**
 * Fetch all resumes for the current user
 */
export async function fetchResumes(): Promise<ResumeData[]> {
  try {
    const response = await fetch("/api/trpc/resume.list", {
      method: "GET",
      credentials: "include",
    });
    
    if (!response.ok) {
      console.error("Failed to fetch resumes:", response.statusText);
      return [];
    }
    
    const json = await response.json();
    // tRPC returns { result: { data: ... } }
    return json?.result?.data ?? [];
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return [];
  }
}

/**
 * Fetch design overrides for a specific resume
 */
export async function fetchDesignOverrides(
  resumeId: string
): Promise<{ overrides: TemplateOverrides | null; templateId: string } | null> {
  try {
    const response = await fetch(
      `/api/trpc/design.get?input=${encodeURIComponent(JSON.stringify({ resumeId }))}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const json = await response.json();
    return json?.result?.data ?? null;
  } catch (error) {
    console.error("Error fetching design overrides:", error);
    return null;
  }
}

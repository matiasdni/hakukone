"use client";

import { fetchDesignOverrides, fetchResumes } from "@/lib/client-data";
import { useDesignStore } from "@/stores/designStore";
import { useAppStore } from "@/stores/useAppStore";
import type { ResumeData } from "@/types";
import { useUser } from "@stackframe/stack";
import { useEffect } from "react";

export function StoreHydrator() {
  const user = useUser();
  const setResumes = useAppStore((s) => s.setResumes);
  const designStore = useDesignStore.getState();

  useEffect(() => {
    // In development, hydrate even without auth for testing
    if (!user && process.env.NODE_ENV !== "development") return;
    
    fetchResumes()
      .then(async (data: ResumeData[] | unknown) => {
        const resumes = Array.isArray(data) ? data : [];
        setResumes(resumes);
        // Prefetch design overrides for each resume
        await Promise.all(
          resumes.map(async (resume: ResumeData) => {
            const response = await fetchDesignOverrides(resume.id);
            if (!response) return;
            if (response.overrides) {
              designStore.setOverrides(resume.id, response.overrides);
            }
            if (response.templateId) {
              designStore.setTemplateId(resume.id, response.templateId);
            }
          })
        );
      })
      .catch((err: Error) => console.error("Failed to hydrate resumes", err));
  }, [user, setResumes, designStore]);

  return null;
}

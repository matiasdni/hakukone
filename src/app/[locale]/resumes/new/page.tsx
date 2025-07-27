"use client";

import { useSaveResume } from "@/hooks/useTRPC";
import type { ResumeData } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NewResumePage() {
  const router = useRouter();
  const saveResume = useSaveResume();
  const hasCreated = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent multiple executions - use ref to track across re-renders
    if (hasCreated.current) return;
    hasCreated.current = true;

    const id = `resume-${Date.now()}`;
    const newResume: ResumeData = {
      id,
      lastModified: Date.now(),
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      skills: [],
      experience: [],
      education: [],
      customSections: [],
      sectionOrder: [
        { id: "summary", type: "summary" },
        { id: "experience", type: "experience" },
        { id: "education", type: "education" },
        { id: "skills", type: "skills" },
      ],
    };

    saveResume.mutate(
      { resume: newResume },
      {
        onSuccess: () => {
          router.replace(`/resumes/${id}`);
        },
        onError: (err) => {
          console.error("Failed to create resume:", err);
          setError(err.message || "Failed to create resume");
          // Reset so user can try again
          hasCreated.current = false;
        },
      }
    );
  }, []); // Empty deps - run only once on mount

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={() => {
            setError(null);
            hasCreated.current = false;
            window.location.reload();
          }}
          className="rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-600" />
      <span className="ml-3 text-slate-600">Creating resume...</span>
    </div>
  );
}

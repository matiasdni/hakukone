"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import type { ResumeData } from "@/types";

export default function NewResumePage() {
  const router = useRouter();
  const addResume = useAppStore((state) => state.addResume);

  useEffect(() => {
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

    addResume(newResume);
    router.replace(`/resumes/${id}`);
  }, [addResume, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      <span className="ml-3">Creating resume...</span>
    </div>
  );
}

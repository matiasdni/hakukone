"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import type { CoverLetter } from "@/types";

export default function NewCoverLetterPage() {
  const router = useRouter();
  const addCoverLetter = useAppStore((state) => state.addCoverLetter);

  useEffect(() => {
    const newLetter: CoverLetter = {
      id: `cl-${Date.now()}`,
      title: "New Cover Letter",
      company: "",
      jobTitle: "",
      content: "",
      lastModified: Date.now(),
    };

    addCoverLetter(newLetter);
    router.replace(`/cover-letters/${newLetter.id}`);
  }, [addCoverLetter, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      <span className="ml-3">Creating cover letter...</span>
    </div>
  );
}

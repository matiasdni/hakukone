"use client";

import { useSaveCoverLetter } from "@/hooks/useTRPC";
import { useRouter } from "@/i18n/navigation";
import type { CoverLetter } from "@/types";
import { useEffect, useRef, useState } from "react";

export default function NewCoverLetterPage() {
  const router = useRouter();
  const saveCoverLetter = useSaveCoverLetter();
  const hasCreated = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasCreated.current) return;
    hasCreated.current = true;

    const newLetter: CoverLetter = {
      id: `cl-${Date.now()}`,
      title: "New Cover Letter",
      company: "",
      jobTitle: "",
      content: "",
      lastModified: Date.now(),
    };

    saveCoverLetter.mutate(
      { coverLetter: newLetter },
      {
        onSuccess: () => router.replace(`/cover-letters/${newLetter.id}`),
        onError: (err) =>
          setError(err.message || "Failed to create cover letter"),
      }
    );
  }, [router, saveCoverLetter]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => router.push("/cover-letters")}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      <span className="ml-3">Creating cover letter...</span>
    </div>
  );
}

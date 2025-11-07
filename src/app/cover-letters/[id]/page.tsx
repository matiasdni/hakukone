"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import type { CoverLetter } from "@/types";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ChatBot } from "@/components/ChatBot";
import { ReviewPanel } from "@/components/ai/ReviewPanel";
import { Modal } from "@/components/ui/Modal";
import { clsx } from "clsx";
import {
  Save,
  Download,
  Eye,
  Wand2,
  FileText,
  Building2,
  Sparkles,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";

type RightPanelMode = "preview" | "ai";

export default function CoverLetterEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const coverLetters = useAppStore((state) => state.coverLetters);
  const resumes = useAppStore((state) => state.resumes);
  const updateCoverLetter = useAppStore((state) => state.updateCoverLetter);

  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [rightPanelMode, setRightPanelMode] =
    useState<RightPanelMode>("preview");
  const [isSaving, setIsSaving] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [reviewData, setReviewData] = useState<{
    overallFeedback: string;
    toneAssessment: string;
    suggestions: string[];
    revisedSnippet?: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    const found = coverLetters.find((l) => l.id === id);
    if (found) {
      setLetter(found);
      if (found.linkedResumeId) {
        setSelectedResumeId(found.linkedResumeId);
      }
    } else {
      router.push("/cover-letters");
    }
  }, [id, coverLetters, router]);

  const handleSave = useCallback(async () => {
    if (!letter) return;
    setIsSaving(true);
    updateCoverLetter(letter.id, letter);
    setTimeout(() => setIsSaving(false), 500);
  }, [letter, updateCoverLetter]);

  const updateField = <K extends keyof CoverLetter>(
    field: K,
    value: CoverLetter[K]
  ) => {
    if (!letter) return;
    setLetter({ ...letter, [field]: value });
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription || !selectedResumeId) return;

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    if (!selectedResume) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: selectedResume,
          jobDescription,
          company: letter?.company || "",
        }),
      });
      const data = await response.json();
      if (data.coverLetter) {
        updateField("content", data.coverLetter);
        updateField("linkedResumeId", selectedResumeId);
        setShowGenerateModal(false);
      }
    } catch (error) {
      console.error("Failed to generate cover letter:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReviewCoverLetter = async () => {
    if (!letter?.content) return;

    setIsReviewing(true);
    try {
      const response = await fetch("/api/ai/review-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: letter.content,
          company: letter.company,
          jobTitle: letter.jobTitle,
        }),
      });
      const data = await response.json();
      setReviewData(data);
      setRightPanelMode("ai");
    } catch (error) {
      console.error("Failed to review cover letter:", error);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRewriteSection = async () => {
    if (!letter?.content) return;

    try {
      const response = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: letter.content,
          context: "cover letter",
        }),
      });
      const data = await response.json();
      if (data.rewritten) {
        updateField("content", data.rewritten);
      }
    } catch (error) {
      console.error("Failed to rewrite:", error);
    }
  };

  const handleDownload = () => {
    if (!letter) return;
    const content = letter.content.replace(/<[^>]*>?/gm, "\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${letter.title || "cover-letter"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!letter) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/cover-letters")}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <FileText className="h-6 w-6 text-purple-600" />
          <input
            type="text"
            value={letter.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="rounded border-none bg-transparent px-2 text-xl font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGenerateModal(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReviewCoverLetter}
            disabled={isReviewing}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            AI Review
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 overflow-y-auto border-r bg-slate-50 p-6">
          {/* Metadata Card */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              Letter Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <Building2 className="mr-1 inline h-3 w-3" />
                  Company
                </label>
                <input
                  type="text"
                  value={letter.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm transition-shadow outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Job Title
                </label>
                <input
                  type="text"
                  value={letter.jobTitle}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm transition-shadow outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="Position applying for"
                />
              </div>
            </div>
          </div>

          {/* Content Editor Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                Cover Letter Content
              </h3>
              <button
                onClick={handleRewriteSection}
                className="flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-600 hover:text-purple-700"
              >
                <RefreshCw className="h-3 w-3" />
                Rewrite with AI
              </button>
            </div>
            <RichTextEditor
              value={letter.content}
              onChange={(value) => updateField("content", value)}
              placeholder="Write your cover letter here..."
            />
          </div>
        </div>

        {/* Right Panel - Preview/AI */}
        <div className="flex w-1/2 flex-col overflow-hidden bg-white">
          {/* Panel Tabs */}
          <div className="flex shrink-0 border-b bg-slate-50">
            <button
              onClick={() => setRightPanelMode("preview")}
              className={clsx(
                "flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium",
                rightPanelMode === "preview"
                  ? "border-b-2 border-purple-600 bg-white text-purple-600"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
            <button
              onClick={() => setRightPanelMode("ai")}
              className={clsx(
                "flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium",
                rightPanelMode === "ai"
                  ? "border-b-2 border-purple-600 bg-white text-purple-600"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Sparkles className="h-4 w-4" /> AI Review
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {rightPanelMode === "preview" && (
              <div className="min-h-[600px] rounded-lg border bg-white p-8 shadow-lg">
                {letter.content ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: letter.content }}
                  />
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Start writing your cover letter to see the preview</p>
                  </div>
                )}
              </div>
            )}

            {rightPanelMode === "ai" && (
              <div className="space-y-6">
                {reviewData ? (
                  <>
                    <ReviewPanel
                      review={{
                        overallFeedback: reviewData.overallFeedback,
                        strengths: [],
                        issues: [],
                        suggestions: reviewData.suggestions,
                      }}
                      type="coverLetter"
                    />
                    {reviewData.toneAssessment && (
                      <div className="rounded-lg border bg-white p-4 shadow-sm">
                        <h3 className="mb-2 text-lg font-medium text-slate-800">
                          Tone Assessment
                        </h3>
                        <p className="text-slate-600">
                          {reviewData.toneAssessment}
                        </p>
                      </div>
                    )}
                    {reviewData.revisedSnippet && (
                      <div className="rounded-lg border bg-purple-50 p-4">
                        <h3 className="mb-2 text-lg font-medium text-purple-800">
                          Suggested Revision
                        </h3>
                        <p className="text-slate-700">
                          {reviewData.revisedSnippet}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            updateField(
                              "content",
                              reviewData.revisedSnippet || ""
                            )
                          }
                        >
                          Apply Revision
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <Wand2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <h3 className="mb-2 text-lg font-medium text-slate-700">
                      Get AI Feedback
                    </h3>
                    <p className="mb-4 text-slate-500">
                      Let AI analyze your cover letter for improvements
                    </p>
                    <Button
                      onClick={handleReviewCoverLetter}
                      disabled={!letter.content || isReviewing}
                    >
                      {isReviewing ? "Analyzing..." : "Start AI Review"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Cover Letter with AI"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Select Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Choose a resume...</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.fullName || "Untitled Resume"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-purple-500"
              rows={8}
              placeholder="Paste the job description here..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGenerateModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateCoverLetter}
              disabled={!selectedResumeId || !jobDescription || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ChatBot */}
      <ChatBot />
    </div>
  );
}

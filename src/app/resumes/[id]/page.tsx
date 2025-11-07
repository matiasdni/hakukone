"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import type { ResumeData, Experience, Education, SectionConfig } from "@/types";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ResumePreview } from "@/components/ResumePreview";
import { ChatBot } from "@/components/ChatBot";
import { MatchAnalysisPanel } from "@/components/ai/MatchAnalysisPanel";
import { ReviewPanel } from "@/components/ai/ReviewPanel";
import { Modal } from "@/components/ui/Modal";
import { generateDocx } from "@/services/docxService";
import { clsx } from "clsx";
import {
  Save,
  Download,
  Plus,
  Trash2,
  GripVertical,
  X,
  Wand2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  FileText,
  Briefcase,
  Eye,
  BarChart2,
  Sparkles,
  Layout,
} from "lucide-react";

type RightPanelMode = "preview" | "ai" | "match";

// Draggable Section Wrapper
const DraggableSection = ({
  children,
  id,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  draggedId,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  children: React.ReactNode;
  id: string;
  index: number;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDrop: (e: React.DragEvent, idx: number) => void;
  draggedId: string | null;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const [isDraggable, setIsDraggable] = useState(false);

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => {
        if (!isDraggable) {
          e.preventDefault();
          return;
        }
        onDragStart(e, id);
      }}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={clsx(
        "group relative rounded-xl border p-6 transition-all duration-200",
        draggedId === id
          ? "border-dashed border-blue-400 bg-blue-50 opacity-50"
          : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md"
      )}
    >
      <div
        className="absolute top-6 left-2 z-10 hidden cursor-grab items-center justify-center rounded p-2 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-500 md:flex"
        title="Drag to reorder"
        onMouseEnter={() => setIsDraggable(true)}
        onMouseLeave={() => setIsDraggable(false)}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 md:hidden">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="rounded bg-slate-100 p-1 text-slate-600 hover:bg-blue-100 disabled:opacity-30"
          title="Move Up"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="rounded bg-slate-100 p-1 text-slate-600 hover:bg-blue-100 disabled:opacity-30"
          title="Move Down"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      <div className="pt-2 pl-0 md:pt-0 md:pl-8">{children}</div>
    </div>
  );
};

// Input Component
const Input = ({
  label,
  value,
  onChange,
  id,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id?: string;
  placeholder?: string;
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase"
      >
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        className="w-full rounded-lg border border-slate-200 p-2.5 text-sm transition-shadow outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
      />
    </div>
  );
};

export default function ResumeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const resumes = useAppStore((state) => state.resumes);
  const updateResume = useAppStore((state) => state.updateResume);

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [rightPanelMode, setRightPanelMode] =
    useState<RightPanelMode>("preview");
  const [isSaving, setIsSaving] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [matchAnalysis, setMatchAnalysis] = useState<{
    score: number;
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  } | null>(null);
  const [reviewData, setReviewData] = useState<{
    overallFeedback: string;
    strengths: string[];
    issues: string[];
    suggestions: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  useEffect(() => {
    const found = resumes.find((r) => r.id === id);
    if (found) {
      setResume(found);
    } else {
      router.push("/resumes");
    }
  }, [id, resumes, router]);

  // Auto-save effect
  useEffect(() => {
    if (!resume) return;
    const timer = setTimeout(() => {
      updateResume(resume.id, resume);
    }, 2000);
    return () => clearTimeout(timer);
  }, [resume, updateResume]);

  const handleSave = useCallback(async () => {
    if (!resume) return;
    setIsSaving(true);
    updateResume(resume.id, resume);
    setTimeout(() => setIsSaving(false), 500);
  }, [resume, updateResume]);

  const handleDownloadDocx = async () => {
    if (!resume) return;
    try {
      const blob = await generateDocx(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.fullName || "resume"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate DOCX:", error);
    }
  };

  const updateField = <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => {
    if (!resume) return;
    setResume({ ...resume, [field]: value });
  };

  // Experience handlers
  const addExperience = () => {
    if (!resume) return;
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: "Company Name",
      role: "Your Role",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    updateField("experience", [...resume.experience, newExp]);
  };

  const updateExperience = (expId: string, updates: Partial<Experience>) => {
    if (!resume) return;
    updateField(
      "experience",
      resume.experience.map((exp) =>
        exp.id === expId ? { ...exp, ...updates } : exp
      )
    );
  };

  const deleteExperience = (expId: string) => {
    if (!resume) return;
    updateField(
      "experience",
      resume.experience.filter((exp) => exp.id !== expId)
    );
  };

  // Education handlers
  const addEducation = () => {
    if (!resume) return;
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      school: "University Name",
      degree: "Degree",
      year: "",
    };
    updateField("education", [...resume.education, newEdu]);
  };

  const updateEducation = (eduId: string, updates: Partial<Education>) => {
    if (!resume) return;
    updateField(
      "education",
      resume.education.map((edu) =>
        edu.id === eduId ? { ...edu, ...updates } : edu
      )
    );
  };

  const deleteEducation = (eduId: string) => {
    if (!resume) return;
    updateField(
      "education",
      resume.education.filter((edu) => edu.id !== eduId)
    );
  };

  // Section drag handlers
  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    e.dataTransfer.setData("sectionId", sectionId);
    setDraggedSectionId(sectionId);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Index is needed for API but not used
  const handleSectionDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
  };

  const handleSectionDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!resume || !draggedSectionId) return;

    const draggedIndex = resume.sectionOrder.findIndex(
      (s) => s.id === draggedSectionId
    );
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedSectionId(null);
      return;
    }

    const newOrder = [...resume.sectionOrder];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);
    updateField("sectionOrder", newOrder);
    setDraggedSectionId(null);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!resume) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= resume.sectionOrder.length) return;

    const newOrder = [...resume.sectionOrder];
    [newOrder[index], newOrder[newIndex]] = [
      newOrder[newIndex],
      newOrder[index],
    ];
    updateField("sectionOrder", newOrder);
  };

  // AI handlers
  const handleRewriteWithAI = async (field: string, content: string) => {
    try {
      const response = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, context: field }),
      });
      const data = await response.json();
      if (data.rewritten && field === "summary") {
        updateField("summary", data.rewritten);
      }
    } catch (error) {
      console.error("AI rewrite failed:", error);
    }
  };

  const handleAnalyzeMatch = async () => {
    if (!resume || !jobDescription) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/match-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });
      const data = await response.json();
      setMatchAnalysis(data);
      setShowJobModal(false);
      setRightPanelMode("match");
    } catch (error) {
      console.error("Match analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReviewResume = async () => {
    if (!resume) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/review-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });
      const data = await response.json();
      setReviewData(data);
      setRightPanelMode("ai");
    } catch (error) {
      console.error("Review failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render section based on type
  const renderSection = (config: SectionConfig, index: number) => {
    if (!resume) return null;

    const sectionContent = (() => {
      switch (config.type) {
        case "summary":
          return (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  Professional Summary
                </h3>
                <button
                  onClick={() => handleRewriteWithAI("summary", resume.summary)}
                  className="flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-600 hover:text-purple-700"
                >
                  <Wand2 className="h-3 w-3" /> Enhance with AI
                </button>
              </div>
              <RichTextEditor
                value={resume.summary}
                onChange={(value) => updateField("summary", value)}
                placeholder="Write a compelling summary..."
              />
            </div>
          );

        case "experience":
          return (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  Work Experience
                </h3>
                <button
                  onClick={addExperience}
                  className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              <div className="space-y-4">
                {resume.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex justify-end">
                      <button
                        onClick={() => deleteExperience(exp.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Company"
                        value={exp.company}
                        onChange={(v) =>
                          updateExperience(exp.id, { company: v })
                        }
                      />
                      <Input
                        label="Role"
                        value={exp.role}
                        onChange={(v) => updateExperience(exp.id, { role: v })}
                      />
                      <Input
                        label="Start Date"
                        value={exp.startDate}
                        onChange={(v) =>
                          updateExperience(exp.id, { startDate: v })
                        }
                        placeholder="Jan 2020"
                      />
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Input
                            label="End Date"
                            value={exp.current ? "" : exp.endDate}
                            onChange={(v) =>
                              updateExperience(exp.id, { endDate: v })
                            }
                            placeholder="Present"
                          />
                        </div>
                        <label className="flex items-center gap-1 pb-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) =>
                              updateExperience(exp.id, {
                                current: e.target.checked,
                              })
                            }
                          />
                          Current
                        </label>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                        Description
                      </label>
                      <RichTextEditor
                        value={exp.description}
                        onChange={(v) =>
                          updateExperience(exp.id, { description: v })
                        }
                        placeholder="Describe your role and achievements..."
                      />
                    </div>
                  </div>
                ))}
                {resume.experience.length === 0 && (
                  <p className="py-4 text-center text-slate-400">
                    No experience added yet
                  </p>
                )}
              </div>
            </div>
          );

        case "education":
          return (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Education</h3>
                <button
                  onClick={addEducation}
                  className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              <div className="space-y-4">
                {resume.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex justify-end">
                      <button
                        onClick={() => deleteEducation(edu.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="School"
                        value={edu.school}
                        onChange={(v) => updateEducation(edu.id, { school: v })}
                      />
                      <Input
                        label="Degree"
                        value={edu.degree}
                        onChange={(v) => updateEducation(edu.id, { degree: v })}
                      />
                      <Input
                        label="Year"
                        value={edu.year}
                        onChange={(v) => updateEducation(edu.id, { year: v })}
                      />
                    </div>
                  </div>
                ))}
                {resume.education.length === 0 && (
                  <p className="py-4 text-center text-slate-400">
                    No education added yet
                  </p>
                )}
              </div>
            </div>
          );

        case "skills":
          return (
            <div>
              <h3 className="mb-4 text-lg font-bold text-slate-800">Skills</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      {skill}
                      <button
                        onClick={() =>
                          updateField(
                            "skills",
                            resume.skills.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type a skill and press Enter or comma to add"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const value = input.value.trim().replace(/,$/, "");
                      if (value && !resume.skills.includes(value)) {
                        updateField("skills", [...resume.skills, value]);
                        input.value = "";
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim().replace(/,$/, "");
                    if (value && !resume.skills.includes(value)) {
                      updateField("skills", [...resume.skills, value]);
                      e.target.value = "";
                    }
                  }}
                />
                <p className="text-xs text-slate-400">
                  Press Enter or type comma to add each skill
                </p>
              </div>
            </div>
          );

        default:
          return null;
      }
    })();

    if (!sectionContent) return null;

    return (
      <DraggableSection
        key={config.id}
        id={config.id}
        index={index}
        onDragStart={handleSectionDragStart}
        onDragOver={handleSectionDragOver}
        onDrop={handleSectionDrop}
        draggedId={draggedSectionId}
        onMoveUp={() => moveSection(index, "up")}
        onMoveDown={() => moveSection(index, "down")}
        isFirst={index === 0}
        isLast={index === resume.sectionOrder.length - 1}
      >
        {sectionContent}
      </DraggableSection>
    );
  };

  if (!resume) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/resumes")}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <FileText className="h-6 w-6 text-blue-600" />
          <input
            type="text"
            value={resume.fullName || "Untitled Resume"}
            onChange={(e) => updateField("fullName", e.target.value)}
            className="rounded border-none bg-transparent px-2 text-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowJobModal(true)}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Match Job
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReviewResume}
            disabled={isAnalyzing}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Review
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
            <Download className="mr-2 h-4 w-4" />
            DOCX
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
          {/* Header Info */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={resume.fullName}
                onChange={(v) => updateField("fullName", v)}
              />
              <Input
                label="Title"
                value={resume.title}
                onChange={(v) => updateField("title", v)}
              />
              <Input
                label="Email"
                value={resume.email}
                onChange={(v) => updateField("email", v)}
              />
              <Input
                label="Phone"
                value={resume.phone}
                onChange={(v) => updateField("phone", v)}
              />
              <div className="col-span-2">
                <Input
                  label="Location"
                  value={resume.location || ""}
                  onChange={(v) => updateField("location", v)}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Sections */}
          <div className="space-y-6">
            {resume.sectionOrder.map((config, index) =>
              renderSection(config, index)
            )}
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
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
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
            <button
              onClick={() => setRightPanelMode("match")}
              className={clsx(
                "flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium",
                rightPanelMode === "match"
                  ? "border-b-2 border-green-600 bg-white text-green-600"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <BarChart2 className="h-4 w-4" /> Job Match
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {rightPanelMode === "preview" && (
              <div>
                {/* Template Selector */}
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <label className="mb-2 flex items-center gap-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    <Layout className="h-3 w-3" /> Template
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "modern", name: "Modern" },
                      { id: "minimal", name: "Minimal" },
                      { id: "creative", name: "Creative" },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => updateField("templateId", tpl.id)}
                        className={clsx(
                          "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          resume.templateId === tpl.id ||
                            (!resume.templateId && tpl.id === "modern")
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                        )}
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="origin-top scale-[0.85] transform">
                  <ResumePreview data={resume} />
                </div>
              </div>
            )}

            {rightPanelMode === "ai" && (
              <div>
                {reviewData ? (
                  <ReviewPanel review={reviewData} type="resume" />
                ) : (
                  <div className="py-12 text-center">
                    <Sparkles className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <h3 className="mb-2 text-lg font-medium text-slate-700">
                      Get AI Feedback
                    </h3>
                    <p className="mb-4 text-slate-500">
                      Let AI analyze your resume for improvements
                    </p>
                    <Button onClick={handleReviewResume} disabled={isAnalyzing}>
                      {isAnalyzing ? "Analyzing..." : "Start AI Review"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {rightPanelMode === "match" && (
              <div>
                {matchAnalysis ? (
                  <MatchAnalysisPanel analysis={matchAnalysis} />
                ) : (
                  <div className="py-12 text-center">
                    <BarChart2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <h3 className="mb-2 text-lg font-medium text-slate-700">
                      Match Against a Job
                    </h3>
                    <p className="mb-4 text-slate-500">
                      See how well your resume fits a specific job
                    </p>
                    <Button onClick={() => setShowJobModal(true)}>
                      Analyze Job Match
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Description Modal */}
      <Modal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        title="Analyze Job Match"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Paste Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={10}
              placeholder="Paste the job description here..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowJobModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAnalyzeMatch}
              disabled={!jobDescription || isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Match"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ChatBot */}
      <ChatBot resumeContext={resume} />
    </div>
  );
}

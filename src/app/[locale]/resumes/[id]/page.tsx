"use client";

import { ChatBot } from "@/components/ChatBot";
import { ResumePreview } from "@/components/ResumePreview";
import { MatchAnalysisPanel } from "@/components/ai/MatchAnalysisPanel";
import { ReviewPanel } from "@/components/ai/ReviewPanel";
import { DesignPanel } from "@/components/editor/DesignPanel";
import {
  CollapsibleSection,
  PersonalInfoHeader,
  sectionIcons,
} from "@/components/editor/EditorComponents";
import {
  CustomSectionForm,
  EducationSectionForm,
  ExperienceSectionForm,
  LanguagesSectionForm,
  SkillsSectionForm,
  SummarySectionForm,
} from "@/components/editor/SectionForms";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PDFDownloadButton } from "@/components/ui/PDFDownloadButton";
import { DesignProvider } from "@/contexts/DesignContext";
import {
  useAIHandlers,
  useCustomSectionHandlers,
  useEducationHandlers,
  useExperienceHandlers,
  useLanguageHandlers,
  useResumeEditor,
  useSectionDragHandlers,
} from "@/hooks/useResumeEditor";
import { generateDocx } from "@/services/docxService";
import type { ResumeData, SectionConfig } from "@/types";
import { clsx } from "clsx";
import {
  Briefcase,
  ChevronLeft,
  Download,
  FileText,
  Plus,
  Save,
  SlidersHorizontal,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { memo, useCallback, useState } from "react";

// ============================================
// Memoized Section Renderer
// ============================================

interface SectionContentProps {
  config: SectionConfig;
  resume: ResumeData;
  onUpdateExperience: (
    expId: string,
    updates: Partial<import("@/types").Experience>
  ) => void;
  onDeleteExperience: (expId: string) => void;
  onUpdateEducation: (
    eduId: string,
    updates: Partial<import("@/types").Education>
  ) => void;
  onDeleteEducation: (eduId: string) => void;
  onUpdateSkills: (skills: string[]) => void;
  onUpdateLanguage: (
    langId: string,
    updates: Partial<import("@/types").Language>
  ) => void;
  onDeleteLanguage: (langId: string) => void;
  onUpdateCustomItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<import("@/types").CustomItem>
  ) => void;
  onDeleteCustomItem: (sectionId: string, itemId: string) => void;
  onUpdateSummary: (value: string) => void;
  onRewriteWithAI?: (field: string, content: string) => void;
}

const SectionContent = memo(function SectionContent({
  config,
  resume,
  onUpdateExperience,
  onDeleteExperience,
  onUpdateEducation,
  onDeleteEducation,
  onUpdateSkills,
  onUpdateLanguage,
  onDeleteLanguage,
  onUpdateCustomItem,
  onDeleteCustomItem,
  onUpdateSummary,
  onRewriteWithAI,
}: SectionContentProps) {
  switch (config.type) {
    case "summary":
      return (
        <SummarySectionForm
          value={resume.summary}
          onChange={onUpdateSummary}
          onRewriteWithAI={onRewriteWithAI}
        />
      );

    case "experience":
      return (
        <ExperienceSectionForm
          experiences={resume.experience}
          onUpdate={onUpdateExperience}
          onDelete={onDeleteExperience}
        />
      );

    case "education":
      return (
        <EducationSectionForm
          education={resume.education}
          onUpdate={onUpdateEducation}
          onDelete={onDeleteEducation}
        />
      );

    case "skills":
      return (
        <SkillsSectionForm skills={resume.skills} onUpdate={onUpdateSkills} />
      );

    case "languages":
      return (
        <LanguagesSectionForm
          languages={resume.languages || []}
          onUpdate={onUpdateLanguage}
          onDelete={onDeleteLanguage}
        />
      );

    case "custom": {
      const customSection = (resume.customSections || []).find(
        (s) => s.id === config.id
      );
      if (!customSection) return null;

      return (
        <CustomSectionForm
          section={customSection}
          onUpdateItem={(itemId, updates) =>
            onUpdateCustomItem(config.id, itemId, updates)
          }
          onDeleteItem={(itemId) => onDeleteCustomItem(config.id, itemId)}
        />
      );
    }

    default:
      return null;
  }
});

// ============================================
// Main Editor Page Component
// ============================================

export default function ResumeEditorPage() {
  // Use all the extracted hooks
  const {
    resume,
    templateOverrides,
    isSaving,
    updateField,
    handleSave,
    router,
    resumeId,
  } = useResumeEditor();

  const { addExperience, updateExperience, deleteExperience } =
    useExperienceHandlers(resume, updateField);
  const { addEducation, updateEducation, deleteEducation } =
    useEducationHandlers(resume, updateField);
  const { addLanguage, updateLanguage, deleteLanguage } = useLanguageHandlers(
    resume,
    updateField
  );
  const {
    addCustomSection,
    updateSectionTitle,
    addCustomItem,
    updateCustomItem,
    deleteCustomItem,
    deleteCustomSection,
  } = useCustomSectionHandlers(resume, updateField);
  const {
    draggedSectionId,
    handleSectionDragStart,
    handleSectionDragOver,
    handleSectionDrop,
  } = useSectionDragHandlers(resume, updateField);
  const {
    showJobModal,
    setShowJobModal,
    showAIModal,
    setShowAIModal,
    jobDescription,
    setJobDescription,
    isAnalyzing,
    matchAnalysis,
    setMatchAnalysis,
    reviewData,
    handleRewriteWithAI,
    handleAnalyzeMatch,
    handleReviewResume,
  } = useAIHandlers(resume, updateField);

  // Local UI state
  const [previewScale, setPreviewScale] = useState(0.55);
  const [showDesignPanel, setShowDesignPanel] = useState(true);

  // Callbacks
  const handleUpdateSummary = useCallback(
    (value: string) => {
      updateField("summary", value);
    },
    [updateField]
  );

  const handleUpdateSkills = useCallback(
    (skills: string[]) => {
      updateField("skills", skills);
    },
    [updateField]
  );

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

  if (!resume) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <DesignProvider resumeId={resumeId}>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-900">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/resumes")}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {resume.fullName || "Untitled Resume"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJobModal(true)}
            >
              <Briefcase className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Match</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReviewResume}
              disabled={isAnalyzing}
            >
              <Sparkles className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Review</span>
            </Button>
            <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-600" />
            <Button variant="ghost" size="sm" onClick={handleDownloadDocx}>
              <Download className="h-4 w-4" />
            </Button>
            <PDFDownloadButton
              data={resume}
              overrides={templateOverrides}
              variant="ghost"
            />
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <Save className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">
                {isSaving ? "Saving..." : "Save"}
              </span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Content Editor */}
          <div className="w-80 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            {/* Personal Info */}
            <PersonalInfoHeader
              fullName={resume.fullName}
              title={resume.title}
              email={resume.email}
              phone={resume.phone}
              location={resume.location || ""}
              photoUrl={resume.photoUrl}
              onChange={(field, value) =>
                updateField(field as keyof ResumeData, value as never)
              }
            />

            {/* Sections */}
            <div className="space-y-2">
              {resume.sectionOrder.map((config, index) => {
                const sectionTitle =
                  config.name ||
                  config.type.charAt(0).toUpperCase() + config.type.slice(1);
                const icon = sectionIcons[config.type] || sectionIcons.custom;

                const isEmpty =
                  config.type === "experience"
                    ? resume.experience.length === 0
                    : config.type === "education"
                      ? resume.education.length === 0
                      : config.type === "skills"
                        ? resume.skills.length === 0
                        : config.type === "languages"
                          ? (resume.languages || []).length === 0
                          : config.type === "custom"
                            ? (
                                (resume.customSections || []).find(
                                  (s) => s.id === config.id
                                )?.items || []
                              ).length === 0
                            : false;

                const onAdd =
                  config.type === "experience"
                    ? addExperience
                    : config.type === "education"
                      ? addEducation
                      : config.type === "languages"
                        ? addLanguage
                        : config.type === "custom"
                          ? () => addCustomItem(config.id)
                          : undefined;

                const onDelete =
                  config.type === "custom"
                    ? () => deleteCustomSection(config.id)
                    : undefined;

                const onTitleChange =
                  config.type === "custom"
                    ? (newTitle: string) =>
                        updateSectionTitle(config.id, newTitle)
                    : undefined;

                return (
                  <CollapsibleSection
                    key={config.id}
                    id={config.id}
                    title={sectionTitle}
                    icon={icon}
                    onAdd={onAdd}
                    onDelete={onDelete}
                    onTitleChange={onTitleChange}
                    isEditable={config.type === "custom"}
                    isEmpty={isEmpty}
                    emptyMessage={`No ${config.type} added`}
                    index={index}
                    totalSections={resume.sectionOrder.length}
                    onDragStart={handleSectionDragStart}
                    onDragOver={handleSectionDragOver}
                    onDrop={handleSectionDrop}
                    isDragging={draggedSectionId === config.id}
                  >
                    <SectionContent
                      config={config}
                      resume={resume}
                      onUpdateExperience={updateExperience}
                      onDeleteExperience={deleteExperience}
                      onUpdateEducation={updateEducation}
                      onDeleteEducation={deleteEducation}
                      onUpdateSkills={handleUpdateSkills}
                      onUpdateLanguage={updateLanguage}
                      onDeleteLanguage={deleteLanguage}
                      onUpdateCustomItem={updateCustomItem}
                      onDeleteCustomItem={deleteCustomItem}
                      onUpdateSummary={handleUpdateSummary}
                      onRewriteWithAI={handleRewriteWithAI}
                    />
                  </CollapsibleSection>
                );
              })}

              {/* Add Custom Section Button */}
              <button
                onClick={() => addCustomSection()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white py-2 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                <Plus className="h-4 w-4" />
                Add Custom Section
              </button>
            </div>
          </div>

          {/* Center: Preview */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-700">
                <button
                  onClick={() => setPreviewScale((s) => Math.max(0.3, s - 0.1))}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-slate-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-xs text-slate-600 dark:text-slate-300">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={() => setPreviewScale((s) => Math.min(1.2, s + 0.1))}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-slate-200"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              {/* Design Toggle */}
              <button
                onClick={() => setShowDesignPanel(!showDesignPanel)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                  showDesignPanel
                    ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-900/30 dark:text-violet-300"
                    : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Design
              </button>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto bg-slate-200 p-4 dark:bg-slate-900">
              <div className="flex justify-center">
                <ResumePreview
                  data={resume}
                  overrides={templateOverrides}
                  scale={previewScale}
                />
              </div>
            </div>
          </div>

          {/* Right: Design Panel */}
          {showDesignPanel && <DesignPanel />}
        </div>

        {/* Modals */}
        <Modal
          isOpen={showJobModal}
          onClose={() => setShowJobModal(false)}
          title="Match Against Job"
        >
          <div className="space-y-4">
            {matchAnalysis ? (
              <div>
                <MatchAnalysisPanel analysis={matchAnalysis} />
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMatchAnalysis(null);
                      setJobDescription("");
                    }}
                  >
                    New Analysis
                  </Button>
                  <Button onClick={() => setShowJobModal(false)}>Close</Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Paste Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
                    rows={8}
                    placeholder="Paste the job description here..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowJobModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAnalyzeMatch}
                    disabled={!jobDescription || isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          title="AI Review"
        >
          <div>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600" />
                <p className="text-slate-500 dark:text-slate-400">
                  Analyzing your resume...
                </p>
              </div>
            ) : reviewData ? (
              <div>
                <ReviewPanel review={reviewData} type="resume" />
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setShowAIModal(false)}>Close</Button>
                </div>
              </div>
            ) : null}
          </div>
        </Modal>

        {/* ChatBot */}
        <ChatBot resumeContext={resume} />
      </div>
    </DesignProvider>
  );
}

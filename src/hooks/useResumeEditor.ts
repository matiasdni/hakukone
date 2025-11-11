"use client";

import { useDesignOverrides, useResume, useSaveResume } from "@/hooks/useTRPC";
// import type { TemplateOverrides } from "@/lib/templates/types";
import {
  useDesignStore,
  useResumeOverrides,
  useResumeTemplateId,
} from "@/stores/designStore";
import type {
  CustomItem,
  CustomSection,
  Education,
  Experience,
  Language,
  ResumeData,
  SectionConfig,
} from "@/types";
// import { useUser } from "@stackframe/stack";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================
// Main Resume Editor Hook
// ============================================

export function useResumeEditor() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  // const user = useUser();

  // Get store state and actions

  // Design store for overrides - use reactive selectors that subscribe to changes
  const templateOverrides = useResumeOverrides(id);
  const templateId = useResumeTemplateId(id);

  // Get stable action references
  const setTemplateId = useDesignStore((state) => state.setTemplateId);
  const setDesignOverrides = useDesignStore((state) => state.setOverrides);

  // tRPC resume loading
  const { data: resume, isLoading } = useResume(id);
  const saveResume = useSaveResume();

  // Track the last saved version to avoid unnecessary saves
  const lastSavedRef = useRef<string | null>(null);

  // Initialize local state from resume data
  const [localResume, setLocalResume] = useState<ResumeData | null>(null);

  // Track last synced ID to detect resume changes
  const [lastSyncedId, setLastSyncedId] = useState<string | null>(null);

  // Sync local resume when server data changes (different resume loaded)
  // Using state comparison instead of refs during render
  if (resume && resume.id !== lastSyncedId) {
    setLastSyncedId(resume.id);
    setLocalResume(resume);
  }

  // Update lastSavedRef when resume syncs (safe in effect)
  useEffect(() => {
    if (resume && resume.id === lastSyncedId) {
      lastSavedRef.current = JSON.stringify(resume);
    }
  }, [resume, lastSyncedId]);

  useEffect(() => {
    if (!isLoading && !resume) {
      router.push("/resumes");
    }
  }, [isLoading, resume, router]);

  // Hydrate design overrides for this resume from the API
  const { data: designData } = useDesignOverrides(resume?.id);

  useEffect(() => {
    if (designData && resume) {
      if (designData.overrides)
        setDesignOverrides(resume.id, designData.overrides);
      if (designData.templateId)
        setTemplateId(resume.id, designData.templateId);
    }
  }, [designData, resume, setDesignOverrides, setTemplateId]);

  // Auto-save with debounce (tRPC) - only save if content actually changed
  useEffect(() => {
    if (!localResume) return;

    const currentContent = JSON.stringify(localResume);

    // Skip if nothing changed since last save
    if (currentContent === lastSavedRef.current) return;

    const timer = setTimeout(() => {
      // Double-check before saving
      if (currentContent !== lastSavedRef.current) {
        saveResume.mutate({ resume: localResume });
        lastSavedRef.current = currentContent;
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [localResume, saveResume]); // Remove saveResume from deps - it's stable via ref pattern

  // Generic field updater
  const updateField = useCallback(
    <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
      setLocalResume((prev) => (prev ? { ...prev, [field]: value } : null));
    },
    []
  );

  // Manual save
  const handleSave = useCallback(() => {
    if (!localResume) return;
    saveResume.mutate({ resume: localResume });
    lastSavedRef.current = JSON.stringify(localResume);
  }, [localResume, saveResume]);

  // Template change handler
  const handleTemplateChange = useCallback(
    (newTemplateId: string) => {
      if (!resume) return;
      updateField("templateId", newTemplateId);
      setTemplateId(id, newTemplateId);
    },
    [id, resume, updateField, setTemplateId]
  );

  return {
    resume: localResume,
    setResume: setLocalResume,
    templateId,
    templateOverrides,
    isSaving: saveResume.isPending,
    updateField,
    handleSave,
    handleTemplateChange,
    router,
    resumeId: id,
  };
}

// ============================================
// Experience Handlers
// ============================================

export function useExperienceHandlers(
  resume: ResumeData | null,
  updateField: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void
) {
  const addExperience = useCallback(() => {
    if (!resume) return;
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    updateField("experience", [...resume.experience, newExp]);
  }, [resume, updateField]);

  const updateExperience = useCallback(
    (expId: string, updates: Partial<Experience>) => {
      if (!resume) return;
      updateField(
        "experience",
        resume.experience.map((exp) =>
          exp.id === expId ? { ...exp, ...updates } : exp
        )
      );
    },
    [resume, updateField]
  );

  const deleteExperience = useCallback(
    (expId: string) => {
      if (!resume) return;
      updateField(
        "experience",
        resume.experience.filter((exp) => exp.id !== expId)
      );
    },
    [resume, updateField]
  );

  return { addExperience, updateExperience, deleteExperience };
}

// ============================================
// Education Handlers
// ============================================

export function useEducationHandlers(
  resume: ResumeData | null,
  updateField: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void
) {
  const addEducation = useCallback(() => {
    if (!resume) return;
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      school: "",
      degree: "",
      year: "",
    };
    updateField("education", [...resume.education, newEdu]);
  }, [resume, updateField]);

  const updateEducation = useCallback(
    (eduId: string, updates: Partial<Education>) => {
      if (!resume) return;
      updateField(
        "education",
        resume.education.map((edu) =>
          edu.id === eduId ? { ...edu, ...updates } : edu
        )
      );
    },
    [resume, updateField]
  );

  const deleteEducation = useCallback(
    (eduId: string) => {
      if (!resume) return;
      updateField(
        "education",
        resume.education.filter((edu) => edu.id !== eduId)
      );
    },
    [resume, updateField]
  );

  return { addEducation, updateEducation, deleteEducation };
}

// ============================================
// Language Handlers
// ============================================

export function useLanguageHandlers(
  resume: ResumeData | null,
  updateField: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void
) {
  const addLanguage = useCallback(() => {
    if (!resume) return;
    const newLang: Language = {
      id: `lang-${Date.now()}`,
      name: "",
      level: "Intermediate",
    };
    updateField("languages", [...(resume.languages || []), newLang]);
  }, [resume, updateField]);

  const updateLanguage = useCallback(
    (langId: string, updates: Partial<Language>) => {
      if (!resume) return;
      updateField(
        "languages",
        (resume.languages || []).map((lang) =>
          lang.id === langId ? { ...lang, ...updates } : lang
        )
      );
    },
    [resume, updateField]
  );

  const deleteLanguage = useCallback(
    (langId: string) => {
      if (!resume) return;
      updateField(
        "languages",
        (resume.languages || []).filter((lang) => lang.id !== langId)
      );
    },
    [resume, updateField]
  );

  return { addLanguage, updateLanguage, deleteLanguage };
}

// ============================================
// Custom Section Handlers
// ============================================

export function useCustomSectionHandlers(
  resume: ResumeData | null,
  updateField: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void
) {
  // Quick add section without modal
  const addCustomSection = useCallback(
    (title?: string) => {
      if (!resume) return null;

      const sectionId = `custom-${Date.now()}`;
      const sectionTitle = title?.trim() || "New Section";
      const newSection: CustomSection = {
        id: sectionId,
        title: sectionTitle,
        items: [],
      };

      updateField("customSections", [
        ...(resume.customSections || []),
        newSection,
      ]);

      const newConfig: SectionConfig = {
        id: sectionId,
        type: "custom",
        name: sectionTitle,
      };
      updateField("sectionOrder", [...resume.sectionOrder, newConfig]);

      return sectionId;
    },
    [resume, updateField]
  );

  // Update section title (inline editing)
  const updateSectionTitle = useCallback(
    (sectionId: string, newTitle: string) => {
      if (!resume) return;

      // Update custom sections
      updateField(
        "customSections",
        (resume.customSections || []).map((section) =>
          section.id === sectionId ? { ...section, title: newTitle } : section
        )
      );

      // Update section order name
      updateField(
        "sectionOrder",
        resume.sectionOrder.map((config) =>
          config.id === sectionId ? { ...config, name: newTitle } : config
        )
      );
    },
    [resume, updateField]
  );

  const addCustomItem = useCallback(
    (sectionId: string) => {
      if (!resume) return;
      const newItem: CustomItem = {
        id: `item-${Date.now()}`,
        title: "",
        subtitle: "",
        date: "",
        description: "",
      };

      updateField(
        "customSections",
        (resume.customSections || []).map((section) =>
          section.id === sectionId
            ? { ...section, items: [...section.items, newItem] }
            : section
        )
      );
    },
    [resume, updateField]
  );

  const updateCustomItem = useCallback(
    (sectionId: string, itemId: string, updates: Partial<CustomItem>) => {
      if (!resume) return;
      updateField(
        "customSections",
        (resume.customSections || []).map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === itemId ? { ...item, ...updates } : item
                ),
              }
            : section
        )
      );
    },
    [resume, updateField]
  );

  const deleteCustomItem = useCallback(
    (sectionId: string, itemId: string) => {
      if (!resume) return;
      updateField(
        "customSections",
        (resume.customSections || []).map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.filter((item) => item.id !== itemId),
              }
            : section
        )
      );
    },
    [resume, updateField]
  );

  const deleteCustomSection = useCallback(
    (sectionId: string) => {
      if (!resume) return;
      updateField(
        "customSections",
        (resume.customSections || []).filter((s) => s.id !== sectionId)
      );
      updateField(
        "sectionOrder",
        resume.sectionOrder.filter((s) => s.id !== sectionId)
      );
    },
    [resume, updateField]
  );

  return {
    addCustomSection,
    updateSectionTitle,
    addCustomItem,
    updateCustomItem,
    deleteCustomItem,
    deleteCustomSection,
  };
}

// ============================================
// Section Drag Handlers
// ============================================

export function useSectionDragHandlers(
  resume: ResumeData | null,
  updateField: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void
) {
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  const handleSectionDragStart = useCallback(
    (e: React.DragEvent, sectionId: string) => {
      e.dataTransfer.setData("sectionId", sectionId);
      setDraggedSectionId(sectionId);
    },
    []
  );

  const handleSectionDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleSectionDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
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
    },
    [resume, draggedSectionId, updateField]
  );

  return {
    draggedSectionId,
    handleSectionDragStart,
    handleSectionDragOver,
    handleSectionDrop,
  };
}

// ============================================
// AI Handlers
// ============================================

import {
  useAIRewrite,
  useMatchAnalysis,
  useReviewResume,
} from "@/hooks/useTRPC";

// ...existing code...

export function useAIHandlers(
  resume: ResumeData | null,
  updateField: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void
) {
  const resumeToPlainText = useCallback((r: ResumeData) => {
    const parts = [
      r.fullName,
      r.title,
      r.summary,
      `Skills: ${r.skills.join(", ")}`,
      ...r.experience.map(
        (exp) =>
          `${exp.role} at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate}): ${exp.description}`
      ),
      ...r.education.map(
        (edu) => `${edu.degree} at ${edu.school} (${edu.year})`
      ),
      ...(r.languages || []).map((lang) => `${lang.name} (${lang.level})`),
    ];
    return parts.filter(Boolean).join("\n");
  }, []);

  const [showJobModal, setShowJobModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const rewriteMutation = useAIRewrite();
  const matchMutation = useMatchAnalysis();
  const reviewMutation = useReviewResume();

  const handleRewriteWithAI = useCallback(
    async (field: string, content: string) => {
      try {
        const result = await rewriteMutation.mutateAsync({
          text: content,
          tone: field === "summary" ? "professional" : "concise",
          language: "en",
        });
        if (result && field === "summary") {
          updateField("summary", result);
        }
      } catch (error) {
        console.error("AI rewrite failed:", error);
      }
    },
    [updateField, rewriteMutation]
  );

  const handleAnalyzeMatch = useCallback(async () => {
    if (!resume || !jobDescription) return;
    setIsAnalyzing(true);
    try {
      const result = await matchMutation.mutateAsync({
        resumeText: resumeToPlainText(resume),
        jobDescription,
        language: "en",
      });
      setMatchAnalysis(result || null);
      setShowJobModal(false);
    } catch (error) {
      console.error("Match analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [resume, jobDescription, matchMutation, resumeToPlainText]);

  const handleReviewResume = useCallback(async () => {
    if (!resume) return;
    setIsAnalyzing(true);
    setShowAIModal(true);
    try {
      const result = await reviewMutation.mutateAsync({
        resumeText: resumeToPlainText(resume),
        language: "en",
      });
      setReviewData(result || null);
    } catch (error) {
      console.error("Review failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [resume, reviewMutation, resumeToPlainText]);

  return {
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
  };
}

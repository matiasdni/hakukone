"use client";

import { ResumePreview } from "@/components/ResumePreview";
import { DesignPanel } from "@/components/editor/DesignPanel";
import { Button } from "@/components/ui/Button";
import { DesignProvider } from "@/contexts/DesignContext";
import { templateRegistry } from "@/lib/templates";
import type { TemplateOverrides } from "@/lib/templates/types";
import { useAppStore } from "@/stores/useAppStore";
import type { ResumeData } from "@/types";
import {
  ChevronLeft,
  Save,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

// Sample data for template preview
const sampleResumeData: ResumeData = {
  id: "template-preview",
  lastModified: Date.now(),
  fullName: "Alex Johnson",
  title: "Senior Software Engineer",
  email: "alex.johnson@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  photoUrl: "",
  socialLinks: [
    { platform: "linkedin", url: "linkedin.com/in/alexjohnson" },
    { platform: "github", url: "github.com/alexj" },
  ],
  summary:
    "Passionate software engineer with 8+ years of experience building scalable web applications. Expert in React, TypeScript, and cloud architecture.",
  skills: ["React", "TypeScript", "Node.js", "AWS", "Python", "Docker"],
  experience: [
    {
      id: "1",
      company: "TechCorp Inc.",
      role: "Senior Software Engineer",
      startDate: "Jan 2022",
      endDate: "",
      current: true,
      description:
        "Led development of customer-facing dashboard serving 2M+ users.",
    },
    {
      id: "2",
      company: "StartupXYZ",
      role: "Software Engineer",
      startDate: "Mar 2019",
      endDate: "Dec 2021",
      current: false,
      description: "Built real-time collaboration features using WebSockets.",
    },
  ],
  education: [
    {
      id: "1",
      school: "Stanford University",
      degree: "M.S. Computer Science",
      year: "2019",
    },
  ],
  languages: [
    { id: "1", name: "English", level: "Native" },
    { id: "2", name: "Spanish", level: "Proficient" },
  ],
  customSections: [],
  sectionOrder: [
    { id: "summary", type: "summary" },
    { id: "experience", type: "experience" },
    { id: "education", type: "education" },
    { id: "skills", type: "skills" },
    { id: "languages", type: "languages" },
  ],
  templateId: "modern",
};

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const { customTemplates, updateCustomTemplate } = useAppStore();
  const [previewScale, setPreviewScale] = useState(0.6);
  const [showDesignPanel, setShowDesignPanel] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Find the custom template
  const customTemplate = useMemo(() => {
    return customTemplates.find((t) => t.id === templateId);
  }, [customTemplates, templateId]);

  // Get the base template definition
  const baseTemplate = useMemo(() => {
    if (!customTemplate) return templateRegistry.get("modern");
    return templateRegistry.get(customTemplate.baseTemplateId);
  }, [customTemplate]);

  // Merge base template defaults with custom overrides
  const templateOverrides = useMemo<TemplateOverrides>(() => {
    if (!customTemplate || !baseTemplate) return {};

    // Build overrides from the base template's config
    const baseOverrides: TemplateOverrides = {
      colors: baseTemplate.colors,
      typography: baseTemplate.typography,
      layout: {
        type: baseTemplate.layout.type,
        sectionGap: baseTemplate.layout.sectionGap,
        itemGap: baseTemplate.layout.itemGap,
        pagePadding: baseTemplate.layout.pagePadding,
      },
    };

    return {
      ...baseOverrides,
      ...customTemplate.overrides,
    };
  }, [customTemplate, baseTemplate]);

  // Resume data with the template ID
  const previewData = useMemo<ResumeData>(
    () => ({
      ...sampleResumeData,
      id: templateId,
      templateId: customTemplate?.baseTemplateId || "modern",
    }),
    [templateId, customTemplate]
  );

  const handleSave = useCallback(() => {
    if (!customTemplate) return;
    setIsSaving(true);
    updateCustomTemplate(templateId, { updatedAt: Date.now() });
    setTimeout(() => {
      setIsSaving(false);
      router.push("/templates");
    }, 500);
  }, [customTemplate, templateId, updateCustomTemplate, router]);

  // Handle if template not found (e.g., built-in template or invalid ID)
  if (!customTemplate) {
    // Check if it's a built-in template
    const builtInTemplate = templateRegistry.get(templateId);
    if (builtInTemplate) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-8">
          <h1 className="mb-4 text-2xl font-bold text-slate-800">
            Built-in Template
          </h1>
          <p className="mb-6 text-slate-600">
            Built-in templates cannot be edited. Create a custom template based
            on this one to customize it.
          </p>
          <Button onClick={() => router.push("/templates")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-8">
        <h1 className="mb-4 text-2xl font-bold text-slate-800">
          Template Not Found
        </h1>
        <p className="mb-6 text-slate-600">
          The template you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/templates")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <DesignProvider resumeId={templateId}>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/templates")}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-semibold text-slate-800">
                {customTemplate.name}
              </h1>
              <p className="text-xs text-slate-500">
                Based on: {customTemplate.baseTemplateId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/templates")}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex shrink-0 items-center justify-between border-b bg-slate-50 px-4 py-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
                <button
                  onClick={() => setPreviewScale((s) => Math.max(0.3, s - 0.1))}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-xs text-slate-600">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={() => setPreviewScale((s) => Math.min(1.2, s + 0.1))}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setShowDesignPanel(!showDesignPanel)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                  showDesignPanel
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Design
              </button>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-auto bg-slate-200 p-6">
              <div className="flex justify-center">
                <ResumePreview
                  data={previewData}
                  overrides={templateOverrides}
                  scale={previewScale}
                />
              </div>
            </div>
          </div>

          {/* Design Panel */}
          {showDesignPanel && <DesignPanel />}
        </div>
      </div>
    </DesignProvider>
  );
}

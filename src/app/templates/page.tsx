"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Palette, Check, Eye } from "lucide-react";
import { ResumePreview } from "@/components/ResumePreview";
import { useAppStore } from "@/stores/useAppStore";
import { ResumeData } from "@/types";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";

const templates = [
  {
    id: "modern",
    name: "Modern",
    description:
      "Clean and professional with a left-aligned header and blue accents",
    tags: ["Professional", "Clean", "Corporate"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple black and white centered design focused on content",
    tags: ["Simple", "Elegant", "Minimalist"],
  },
  {
    id: "creative",
    name: "Creative",
    description: "Two-column layout with a dark sidebar for standout appeal",
    tags: ["Creative", "Bold", "Two-Column"],
  },
];

// Sample data for template preview
const sampleResumeData: ResumeData = {
  id: "sample",
  lastModified: Date.now(),
  fullName: "Alex Johnson",
  title: "Software Engineer",
  email: "alex@example.com",
  phone: "+1 555-123-4567",
  location: "San Francisco, CA",
  photoUrl: "",
  socialLinks: [
    { platform: "linkedin", url: "linkedin.com/in/alexj" },
    { platform: "github", url: "github.com/alexj" },
  ],
  summary:
    "Experienced software engineer with expertise in React, TypeScript, and cloud technologies.",
  skills: ["React", "TypeScript", "Node.js", "AWS"],
  experience: [
    {
      id: "1",
      company: "Tech Corp",
      role: "Senior Developer",
      startDate: "2022",
      endDate: "",
      current: true,
      description: "Led development of core features",
    },
  ],
  education: [
    {
      id: "1",
      school: "State University",
      degree: "B.S. Computer Science",
      year: "2020",
    },
  ],
  customSections: [],
  sectionOrder: [
    { id: "summary", type: "summary" },
    { id: "experience", type: "experience" },
    { id: "education", type: "education" },
    { id: "skills", type: "skills" },
  ],
  templateId: "modern",
};

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<string>("modern");
  const [previewTemplate, setPreviewTemplate] = React.useState<string | null>(
    null
  );
  const { resumes, updateResume } = useAppStore();

  const applyTemplateToAllResumes = () => {
    resumes.forEach((resume) => {
      updateResume(resume.id, { templateId: selectedTemplate });
    });
    const templateName = templates.find((t) => t.id === selectedTemplate)?.name;
    alert(
      'Template "' +
        templateName +
        '" applied to ' +
        resumes.length +
        " resume(s)!"
    );
  };

  const getCardClassName = (templateId: string) => {
    const base =
      "bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md";
    return selectedTemplate === templateId
      ? base + " ring-2 ring-blue-500"
      : base;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Templates</h1>
        <p className="mt-1 text-slate-500">
          Choose a template for your resumes
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className={getCardClassName(template.id)}
            onClick={() => setSelectedTemplate(template.id)}
          >
            {/* Preview area with actual ResumePreview */}
            <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 p-4">
              <div className="pointer-events-none h-[1000px] w-[800px] origin-center scale-[0.25] transform">
                <ResumePreview
                  data={{ ...sampleResumeData, templateId: template.id }}
                />
              </div>
              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewTemplate(template.id);
                }}
                className="absolute right-3 bottom-3 flex items-center gap-1 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-700 shadow hover:bg-white"
              >
                <Eye className="h-4 w-4" /> Preview
              </button>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-slate-800">{template.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {template.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Apply Template */}
      <div className="mt-8 rounded-xl bg-blue-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-800">
              Selected: {templates.find((t) => t.id === selectedTemplate)?.name}
            </h3>
            <p className="text-sm text-slate-500">
              {resumes.length > 0
                ? "Apply this template to all " +
                  resumes.length +
                  " of your resume(s)"
                : "Create a resume first to apply templates"}
            </p>
          </div>
          <div className="flex gap-3">
            {resumes.length === 0 && (
              <Link href="/resumes/new">
                <Button variant="outline">Create Resume</Button>
              </Link>
            )}
            <Button
              onClick={applyTemplateToAllResumes}
              disabled={resumes.length === 0}
            >
              <Palette className="mr-2 h-4 w-4" />
              Apply to All Resumes
            </Button>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Tip:</strong> You can also change the template for individual
          resumes in the resume editor by clicking the template selector at the
          top of the preview panel.
        </p>
      </div>

      {/* Full Preview Modal */}
      <Modal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={
          "Template Preview: " +
          (templates.find((t) => t.id === previewTemplate)?.name || "")
        }
      >
        <div className="-mt-20 mb-[-300px] origin-top scale-[0.6] transform">
          <ResumePreview
            data={{
              ...sampleResumeData,
              templateId: previewTemplate || "modern",
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

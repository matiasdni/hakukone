"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { templateRegistry } from "@/lib/templates";
import { TemplateRenderer } from "@/lib/templates/renderers/html";
import type { TemplateDefinition } from "@/lib/templates/types";
import type { CustomTemplate } from "@/stores/useAppStore";
import { useAppStore } from "@/stores/useAppStore";
import type { ResumeData } from "@/types";
import {
    Edit3,
    Eye,
    Grid3X3,
    List,
    Palette,
    Plus,
    Search,
    Sparkles,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// Sample data for template preview
const sampleResumeData: ResumeData = {
  id: "sample",
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
    "Passionate software engineer with 8+ years of experience building scalable web applications. Expert in React, TypeScript, and cloud architecture. Led teams of 5-10 developers to deliver products used by millions.",
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "AWS",
    "Python",
    "GraphQL",
    "Docker",
    "PostgreSQL",
  ],
  experience: [
    {
      id: "1",
      company: "TechCorp Inc.",
      role: "Senior Software Engineer",
      startDate: "Jan 2022",
      endDate: "",
      current: true,
      description:
        "• Led development of customer-facing dashboard serving 2M+ users\n• Reduced page load time by 60% through performance optimization\n• Mentored 4 junior developers",
    },
    {
      id: "2",
      company: "StartupXYZ",
      role: "Software Engineer",
      startDate: "Mar 2019",
      endDate: "Dec 2021",
      current: false,
      description:
        "• Built real-time collaboration features using WebSockets\n• Implemented CI/CD pipeline reducing deployment time by 80%",
    },
  ],
  education: [
    {
      id: "1",
      school: "Stanford University",
      degree: "M.S. Computer Science",
      year: "2019",
    },
    {
      id: "2",
      school: "UC Berkeley",
      degree: "B.S. Computer Science",
      year: "2017",
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

type ViewMode = "grid" | "list";
type FilterType = "all" | "builtin" | "custom";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function TemplatesPage() {
  const router = useRouter();
  const {
    customTemplates,
    addCustomTemplate,
    deleteCustomTemplate,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [baseTemplateId, setBaseTemplateId] = useState("modern");

  const builtInTemplates = templateRegistry.getBuiltIn();

  // Combine built-in and custom templates
  const allTemplates = useMemo(() => {
    const templates: Array<{
      id: string;
      name: string;
      description: string;
      tags: string[];
      isCustom: boolean;
      baseTemplateId?: string;
      template: TemplateDefinition;
    }> = [];

    // Add built-in templates
    builtInTemplates.forEach((t) => {
      templates.push({
        id: t.id,
        name: t.name,
        description: t.description,
        tags: t.tags,
        isCustom: false,
        template: t,
      });
    });

    // Add custom templates
    customTemplates.forEach((ct) => {
      const base =
        templateRegistry.get(ct.baseTemplateId) ||
        templateRegistry.getDefault();
      templates.push({
        id: ct.id,
        name: ct.name,
        description: ct.description,
        tags: ["Custom", ...base.tags.slice(0, 2)],
        isCustom: true,
        baseTemplateId: ct.baseTemplateId,
        template: base,
      });
    });

    return templates;
  }, [builtInTemplates, customTemplates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      // Filter by type
      if (filter === "builtin" && t.isCustom) return false;
      if (filter === "custom" && !t.isCustom) return false;

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [allTemplates, filter, searchQuery]);

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;

    const newTemplate: CustomTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplateName.trim(),
      description: `Custom template based on ${baseTemplateId}`,
      baseTemplateId,
      overrides: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addCustomTemplate(newTemplate);
    setShowCreateModal(false);
    setNewTemplateName("");

    // Navigate to template editor
    router.push(`/templates/${newTemplate.id}`);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteCustomTemplate(id);
    setShowDeleteModal(null);
  };

  const handleEditTemplate = (id: string) => {
    router.push(`/templates/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-600">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Template Gallery</h1>
              <p className="text-slate-400">
                Beautiful, professional templates for your resume
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 flex gap-8">
            <div>
              <div className="text-2xl font-bold">
                {builtInTemplates.length}
              </div>
              <div className="text-sm text-slate-400">Built-in Templates</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{customTemplates.length}</div>
              <div className="text-sm text-slate-400">Your Templates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Toolbar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          {/* Search & Filter */}
          <div className="flex flex-1 items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              {[
                { value: "all", label: "All" },
                { value: "builtin", label: "Built-in" },
                { value: "custom", label: "My Templates" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as FilterType)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                    filter === option.value
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle & Create */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-md p-2 transition-all",
                  viewMode === "grid"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-md p-2 transition-all",
                  viewMode === "list"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Templates Grid/List */}
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Palette className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              No templates found
            </h3>
            <p className="mt-1 text-slate-500">
              {searchQuery
                ? "Try a different search term"
                : "Create your first custom template"}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => setPreviewTemplate(template.id)}
                onEdit={() => handleEditTemplate(template.id)}
                onDelete={() => setShowDeleteModal(template.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <TemplateListItem
                key={template.id}
                template={template}
                onPreview={() => setPreviewTemplate(template.id)}
                onEdit={() => handleEditTemplate(template.id)}
                onDelete={() => setShowDeleteModal(template.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Template"
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Template Name
            </label>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="My Custom Template"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Base Template
            </label>
            <p className="mb-3 text-xs text-slate-500">
              Start with a built-in template and customize it
            </p>
            <div className="grid grid-cols-2 gap-3">
              {builtInTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setBaseTemplateId(t.id)}
                  className={cn(
                    "rounded-lg border-2 p-3 text-left transition-all",
                    baseTemplateId === t.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="font-medium text-slate-800">{t.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {t.tags.slice(0, 2).join(" • ")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={!newTemplateName.trim()}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Create & Customize
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={`Preview: ${filteredTemplates.find((t) => t.id === previewTemplate)?.name || ""}`}
      >
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="max-h-[70vh] overflow-auto">
            <div
              className="origin-top-left scale-[0.6] transform"
              style={{ width: "166.67%" }}
            >
              <TemplateRenderer
                resume={sampleResumeData}
                templateId={previewTemplate || "modern"}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setPreviewTemplate(null)}>
            Close
          </Button>
          {filteredTemplates.find((t) => t.id === previewTemplate)
            ?.isCustom && (
            <Button
              onClick={() => {
                setPreviewTemplate(null);
                handleEditTemplate(previewTemplate!);
              }}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Template
            </Button>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        title="Delete Template"
      >
        <p className="text-slate-600">
          Are you sure you want to delete this template? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(null)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            className="bg-red-500! text-white! hover:bg-red-600!"
            onClick={() => handleDeleteTemplate(showDeleteModal!)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    tags: string[];
    isCustom: boolean;
    template: TemplateDefinition;
  };
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function TemplateCard({
  template,
  onPreview,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white transition-all duration-200 hover:border-violet-300 hover:shadow-lg"
    >
      {/* Preview */}
      <div
        className="relative h-56 cursor-pointer overflow-hidden bg-linear-to-br from-slate-100 to-slate-50"
        onClick={onPreview}
      >
        <div className="pointer-events-none absolute inset-2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div
            className="origin-top-left scale-[0.18] transform"
            style={{ width: "555%" }}
          >
            <TemplateRenderer
              resume={{ ...sampleResumeData, templateId: template.id }}
              templateId={template.id}
            />
          </div>
        </div>

        {/* Custom Badge */}
        {template.isCustom && (
          <div className="absolute top-3 left-3 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-medium text-white shadow">
            Custom
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition-transform hover:scale-110"
            title="Preview"
          >
            <Eye className="h-5 w-5" />
          </button>
          {template.isCustom && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition-transform hover:scale-110"
                title="Edit"
              >
                <Edit3 className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-800">{template.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {template.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Template List Item Component
function TemplateListItem({
  template,
  onPreview,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-4 transition-all duration-200 hover:border-violet-300 hover:shadow-md"
    >
      {/* Mini Preview */}
      <div
        className="relative h-20 w-16 shrink-0 cursor-pointer overflow-hidden rounded-md border border-slate-200 bg-slate-50"
        onClick={onPreview}
      >
        <div
          className="pointer-events-none origin-top-left scale-[0.08] transform"
          style={{ width: "1250%" }}
        >
          <TemplateRenderer
            resume={{ ...sampleResumeData, templateId: template.id }}
            templateId={template.id}
          />
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800">{template.name}</h3>
          {template.isCustom && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              Custom
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">
          {template.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {template.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onPreview}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          title="Preview"
        >
          <Eye className="h-5 w-5" />
        </button>
        {template.isCustom && (
          <>
            <button
              onClick={onEdit}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="Edit"
            >
              <Edit3 className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

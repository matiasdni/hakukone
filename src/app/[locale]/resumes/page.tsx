"use client";

import { CreateResumeModal } from "@/components/resumes/CreateResumeModal";
import { Button } from "@/components/ui/Button";
import { useDeleteResume, useResumes, useSaveResume } from "@/hooks/useTRPC";
import { Link } from "@/i18n/navigation";
import type { ResumeData } from "@/types";
import { Clock, Copy, Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useCallback } from "react";

// Mini Resume Preview Component
const MiniResumePreview = ({ resume }: { resume: ResumeData }) => (
  <div className="h-full w-full space-y-1.5 overflow-hidden bg-white p-3 text-[6px] leading-tight">
    {/* Header */}
    <div className="border-b border-slate-100 pb-1.5 text-center">
      <div className="truncate text-[8px] font-bold text-slate-700">
        {resume.fullName || "Your Name"}
      </div>
      <div className="truncate text-slate-500">
        {resume.title || "Professional Title"}
      </div>
    </div>

    {/* Summary placeholder */}
    {resume.summary && (
      <div className="space-y-0.5">
        <div className="text-[7px] font-bold text-slate-600 uppercase">
          Summary
        </div>
        <div className="line-clamp-2 text-slate-400">
          {resume.summary.replace(/<[^>]*>/g, "").substring(0, 100)}
        </div>
      </div>
    )}

    {/* Skills preview */}
    {resume.skills?.length > 0 && (
      <div className="space-y-0.5">
        <div className="text-[7px] font-bold text-slate-600 uppercase">
          Skills
        </div>
        <div className="flex flex-wrap gap-0.5">
          {resume.skills.slice(0, 5).map((skill, i) => (
            <span
              key={i}
              className="rounded bg-blue-50 px-1 py-0.5 text-[5px] text-blue-700"
            >
              {skill}
            </span>
          ))}
          {resume.skills.length > 5 && (
            <span className="text-[5px] text-slate-400">
              +{resume.skills.length - 5} more
            </span>
          )}
        </div>
      </div>
    )}

    {/* Experience placeholder lines */}
    <div className="space-y-0.5 pt-1">
      <div className="text-[7px] font-bold text-slate-600 uppercase">
        Experience
      </div>
      <div className="h-1 w-3/4 rounded bg-slate-200"></div>
      <div className="h-1 w-full rounded bg-slate-100"></div>
      <div className="h-1 w-5/6 rounded bg-slate-100"></div>
    </div>
  </div>
);

export default function ResumesPage() {
  const { data: resumes = [], isLoading } = useResumes();
  const saveResume = useSaveResume();
  const deleteResume = useDeleteResume();

  const handleDuplicate = useCallback(
    (id: string) => {
      const resume = resumes.find((r) => r.id === id);
      if (resume) {
        const newResume = {
          ...resume,
          id: crypto.randomUUID(),
          fullName: `${resume.fullName} (Copy)`,
          lastModified: Date.now(),
        };
        saveResume.mutate({ resume: newResume });
      }
    },
    [resumes, saveResume]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm("Are you sure you want to delete this resume?")) {
        deleteResume.mutate({ id });
      }
    },
    [deleteResume]
  );

  const sortedResumes = [...resumes].sort(
    (a, b) => b.lastModified - a.lastModified
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Resumes</h1>
            <p className="mt-2 text-slate-500">
              Manage your resume versions and master templates.
            </p>
          </div>
          <CreateResumeModal />
        </div>

        {/* Resume Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Create New Card */}
          <CreateResumeModal>
            <div className="group flex h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-blue-500 hover:bg-white hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors group-hover:border-blue-200 group-hover:text-blue-500">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-medium text-slate-600 group-hover:text-blue-600">
                Create New Resume
              </span>
            </div>
          </CreateResumeModal>

          {/* Resume Cards */}
          {isLoading ? (
            <div>Loading resumes...</div>
          ) : (
            sortedResumes.map((resume) => (
              <div
                key={resume.id}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Preview Thumbnail */}
                <Link href={`/resumes/${resume.id}`}>
                  <div className="relative h-40 overflow-hidden border-b border-slate-100 bg-slate-100">
                    <div className="h-full w-full origin-top scale-100 transform opacity-60 transition-opacity duration-500 group-hover:scale-105 group-hover:opacity-100">
                      <MiniResumePreview resume={resume} />
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded bg-white/80 p-1 text-slate-600 backdrop-blur-sm hover:bg-slate-200">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Link>

                {/* Meta */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-1 truncate font-bold text-slate-900">
                    {resume.fullName || "Untitled Resume"}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-xs text-slate-500">
                    {resume.title || "No title added yet."}
                  </p>

                  <div className="mt-auto flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {resume.lastModified
                          ? new Date(resume.lastModified).toLocaleDateString()
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
                  <Link href={`/resumes/${resume.id}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(resume.id)}
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(resume.id)}
                    title="Delete"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

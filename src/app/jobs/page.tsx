"use client";

import React, { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { JobApplication } from "@/types";
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Building2,
  BarChart2,
  Target,
} from "lucide-react";
import { clsx } from "clsx";

const columns: {
  title: JobApplication["status"];
  color: string;
  borderColor: string;
}[] = [
  { title: "Saved", color: "bg-slate-50", borderColor: "border-slate-200" },
  { title: "Applying", color: "bg-blue-50/50", borderColor: "border-blue-100" },
  {
    title: "Interview",
    color: "bg-amber-50/50",
    borderColor: "border-amber-100",
  },
  {
    title: "Offer",
    color: "bg-emerald-50/50",
    borderColor: "border-emerald-100",
  },
];

export default function JobsPage() {
  const { jobs, resumes, addJob, updateJob, deleteJob } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({
    role: "",
    company: "",
    description: "",
  });
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);

  // Match analysis state
  const [analysisResumeId, setAnalysisResumeId] = useState<string>("");
  const [matchAnalysis, setMatchAnalysis] = useState<{
    score: number;
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.role || !newJob.company) return;

    const job: JobApplication = {
      id: crypto.randomUUID(),
      role: newJob.role,
      company: newJob.company,
      description: newJob.description,
      status: "Saved",
      dateAdded: Date.now(),
    };

    addJob(job);
    setNewJob({ role: "", company: "", description: "" });
    setIsAddModalOpen(false);
  };

  const handleDeleteJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteJob(id);
    if (selectedJobId === id) setSelectedJobId(null);
  };

  const moveJob = (
    id: string,
    direction: "next" | "prev",
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const statuses: JobApplication["status"][] = [
      "Saved",
      "Applying",
      "Interview",
      "Offer",
    ];
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    const currentIndex = statuses.indexOf(job.status);
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= statuses.length) newIndex = statuses.length - 1;

    updateJob(id, { status: statuses[newIndex] });
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("jobId", id);
    setDraggedJobId(id);
  };

  const handleDragEnd = () => {
    setDraggedJobId(null);
  };

  const handleDrop = (e: React.DragEvent, status: JobApplication["status"]) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("jobId");
    if (jobId) {
      updateJob(jobId, { status });
    }
    setDraggedJobId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAnalyzeMatch = async () => {
    const job = jobs.find((j) => j.id === selectedJobId);
    const resume = resumes.find((r) => r.id === analysisResumeId);
    if (!job || !resume || !job.description) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/match-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription: job.description }),
      });
      const data = await response.json();
      setMatchAnalysis(data);
    } catch (error) {
      console.error("Match analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-6 md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your applications with drag & drop
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Job
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto bg-slate-50/30 p-6">
        <div className="flex h-full min-w-[1000px] gap-6">
          {columns.map((col, colIndex) => (
            <div
              key={col.title}
              className={clsx(
                "flex max-w-xs flex-1 flex-col rounded-2xl border transition-colors",
                col.color,
                col.borderColor,
                draggedJobId ? "ring-opacity-50 ring-2 ring-blue-200" : ""
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.title)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-700">{col.title}</h3>
                  <span className="rounded-full border border-slate-200/50 bg-white/60 px-2 py-0.5 text-xs font-bold text-slate-500 shadow-sm">
                    {jobs.filter((j) => j.status === col.title).length}
                  </span>
                </div>
              </div>

              {/* Cards Area */}
              <div className="flex-1 space-y-3 overflow-y-auto p-3 pt-0">
                {jobs
                  .filter((j) => j.status === col.title)
                  .map((job) => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setMatchAnalysis(null);
                      }}
                      className={clsx(
                        "group relative cursor-grab rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md active:cursor-grabbing",
                        draggedJobId === job.id ? "scale-95 opacity-50" : ""
                      )}
                    >
                      <div className="mb-1 flex items-start justify-between">
                        <div className="pr-4 text-sm leading-tight font-bold text-slate-800">
                          {job.role}
                        </div>
                        <button
                          onClick={(e) => handleDeleteJob(job.id, e)}
                          className="absolute top-3 right-3 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                          aria-label="Delete job"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {job.company}
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-3">
                        <button
                          disabled={colIndex === 0}
                          onClick={(e) => moveJob(job.id, "prev", e)}
                          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 disabled:opacity-30"
                          title="Move Back"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-[10px] font-medium text-slate-400">
                          {new Date(job.dateAdded).toLocaleDateString()}
                        </span>
                        <button
                          disabled={colIndex === columns.length - 1}
                          onClick={(e) => moveJob(job.id, "next", e)}
                          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 disabled:opacity-30"
                          title="Move Forward"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Job Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Application"
      >
        <form onSubmit={handleAddJob} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase">
              Role
            </label>
            <input
              autoFocus
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={newJob.role}
              onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
              placeholder="e.g. Senior Product Manager"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase">
              Company
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={newJob.company}
              onChange={(e) =>
                setNewJob({ ...newJob, company: e.target.value })
              }
              placeholder="e.g. Acme Inc."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase">
              Job Description
            </label>
            <textarea
              className="h-32 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={newJob.description}
              onChange={(e) =>
                setNewJob({ ...newJob, description: e.target.value })
              }
              placeholder="Paste full job posting here for AI analysis..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Job
            </Button>
          </div>
        </form>
      </Modal>

      {/* Job Details Modal */}
      <Modal
        isOpen={!!selectedJobId}
        onClose={() => setSelectedJobId(null)}
        title="Job Details"
      >
        {selectedJob && (
          <div className="max-h-[80vh] space-y-8 overflow-y-auto pr-2">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedJob.role}
              </h2>
              <div className="mt-1 flex items-center gap-2 font-medium text-slate-500">
                <Building2 className="h-5 w-5" />
                <span>{selectedJob.company}</span>
              </div>
            </div>

            {/* Description */}
            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-5">
              <label className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                Job Description
              </label>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
                {selectedJob.description || "No description provided."}
              </p>
            </div>

            {/* Match Analysis Section */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <BarChart2 className="h-5 w-5 text-purple-600" />
                Match Analysis
              </h3>

              {!matchAnalysis ? (
                <div className="space-y-4 rounded-xl border border-purple-100 bg-purple-50 p-5">
                  <p className="text-sm font-medium text-purple-900">
                    Analyze fit against a resume to see score and gaps.
                  </p>
                  <div className="flex gap-3">
                    <select
                      className="flex-1 rounded-lg border border-purple-200 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      value={analysisResumeId}
                      onChange={(e) => setAnalysisResumeId(e.target.value)}
                      aria-label="Select resume for analysis"
                    >
                      <option value="">Select resume...</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.fullName || r.title || "Untitled Resume"}
                        </option>
                      ))}
                    </select>
                    <Button
                      className="bg-purple-600 text-white hover:bg-purple-700"
                      disabled={
                        !analysisResumeId ||
                        !selectedJob.description ||
                        isAnalyzing
                      }
                      onClick={handleAnalyzeMatch}
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Fit"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center gap-4">
                      <div
                        className={clsx(
                          "text-3xl font-bold",
                          matchAnalysis.score >= 80
                            ? "text-green-600"
                            : matchAnalysis.score >= 60
                              ? "text-amber-600"
                              : "text-red-600"
                        )}
                      >
                        {matchAnalysis.score}%
                      </div>
                      <div className="text-sm text-slate-600">Match Score</div>
                    </div>
                    {matchAnalysis.strengths.length > 0 && (
                      <div className="mb-3">
                        <h4 className="mb-2 text-xs font-bold text-green-600 uppercase">
                          Strengths
                        </h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {matchAnalysis.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-500">✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {matchAnalysis.gaps.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-bold text-amber-600 uppercase">
                          Gaps
                        </h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {matchAnalysis.gaps.map((g, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-500">!</span> {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMatchAnalysis(null)}
                    className="w-full text-slate-400 hover:bg-slate-50"
                  >
                    Clear Analysis
                  </Button>
                </div>
              )}
            </div>

            {/* Targeted Resume Section */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <Target className="h-5 w-5 text-blue-600" />
                Targeted Resume
              </h3>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-900">
                  Create a tailored version of your resume for this role.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

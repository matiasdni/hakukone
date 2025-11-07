"use client";

import React from "react";
import Link from "next/link";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Mail,
  Briefcase,
  Plus,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { resumes, coverLetters, jobs } = useAppStore();

  const stats = [
    {
      label: "Resumes",
      value: resumes.length,
      icon: FileText,
      href: "/resumes",
      color: "bg-blue-500",
    },
    {
      label: "Cover Letters",
      value: coverLetters.length,
      icon: Mail,
      href: "/cover-letters",
      color: "bg-purple-500",
    },
    {
      label: "Jobs Tracked",
      value: jobs.length,
      icon: Briefcase,
      href: "/jobs",
      color: "bg-emerald-500",
    },
    {
      label: "Interviews",
      value: jobs.filter((j) => j.status === "Interview").length,
      icon: TrendingUp,
      href: "/jobs",
      color: "bg-amber-500",
    },
  ];

  const recentResumes = [...resumes]
    .sort((a, b) => b.lastModified - a.lastModified)
    .slice(0, 3);

  const recentJobs = [...jobs]
    .sort((a, b) => b.dateAdded - a.dateAdded)
    .slice(0, 5);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Welcome back! Here is your career progress.
          </p>
        </div>
        <Link href="/resumes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Resume
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-800">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Resumes */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Recent Resumes
            </h2>
          </div>
          <div className="p-6">
            {recentResumes.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">No resumes yet</p>
                <Link href="/resumes/new">
                  <Button variant="outline" size="sm" className="mt-4">
                    Create your first resume
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {recentResumes.map((resume) => (
                  <li key={resume.id}>
                    <Link
                      href={`/resumes/${resume.id}`}
                      className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {resume.fullName || "Untitled"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {resume.title || "No title"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="h-4 w-4" />
                        {new Date(resume.lastModified).toLocaleDateString()}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Job Applications */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Job Applications
            </h2>
          </div>
          <div className="p-6">
            {recentJobs.length === 0 ? (
              <div className="py-8 text-center">
                <Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">No jobs tracked yet</p>
                <Link href="/jobs">
                  <Button variant="outline" size="sm" className="mt-4">
                    Add a job
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {recentJobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                        <Briefcase className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{job.role}</p>
                        <p className="text-sm text-slate-500">{job.company}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        job.status === "Interview"
                          ? "bg-amber-100 text-amber-700"
                          : job.status === "Offer"
                            ? "bg-green-100 text-green-700"
                            : job.status === "Applying"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {job.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 p-8 text-white">
        <h2 className="mb-2 text-2xl font-bold">
          Ready to land your dream job?
        </h2>
        <p className="mb-6 text-blue-100">
          Our AI-powered tools can help you create the perfect resume and cover
          letter.
        </p>
        <div className="flex gap-4">
          <Link href="/resumes/new">
            <Button variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              New Resume
            </Button>
          </Link>
          <Link href="/cover-letters/new">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <Mail className="mr-2 h-4 w-4" />
              New Cover Letter
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

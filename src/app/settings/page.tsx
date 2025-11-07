"use client";

import React, { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/Button";
import {
  User,
  Globe,
  Database,
  Trash2,
  Download,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const {
    userProfile,
    setUserProfile,
    resumes,
    coverLetters,
    jobs,
    loadSampleData,
    clearAllData,
  } = useAppStore();

  const [loadingMockData, setLoadingMockData] = useState(false);

  const handleExportData = () => {
    const data = { resumes, coverLetters, jobs, userProfile };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv-builder-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleData = () => {
    if (resumes.length > 0 || coverLetters.length > 0 || jobs.length > 0) {
      if (
        !confirm(
          "This will replace all your current data with sample data. Continue?"
        )
      ) {
        return;
      }
    }
    setLoadingMockData(true);
    setTimeout(() => {
      loadSampleData();
      setLoadingMockData(false);
    }, 500);
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to delete all your data? This cannot be undone."
      )
    ) {
      clearAllData();
    }
  };

  return (
    <div className="max-w-3xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="mt-1 text-slate-500">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <User className="h-5 w-5 text-slate-600" />
          Profile
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              type="text"
              value={userProfile?.name || ""}
              onChange={(e) =>
                setUserProfile({
                  ...userProfile,
                  name: e.target.value,
                  email: userProfile?.email || "",
                  title: userProfile?.title || "",
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={userProfile?.email || ""}
              onChange={(e) =>
                setUserProfile({
                  ...userProfile,
                  email: e.target.value,
                  name: userProfile?.name || "",
                  title: userProfile?.title || "",
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              type="text"
              value={userProfile?.title || ""}
              onChange={(e) =>
                setUserProfile({
                  ...userProfile,
                  title: e.target.value,
                  name: userProfile?.name || "",
                  email: userProfile?.email || "",
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Software Engineer"
            />
          </div>
        </div>
      </section>

      {/* Language Section */}
      <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Globe className="h-5 w-5 text-slate-600" />
          Language
        </h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Preferred Language
          </label>
          <select
            value={userProfile?.language || "en"}
            onChange={(e) =>
              setUserProfile({
                name: userProfile?.name || "",
                email: userProfile?.email || "",
                title: userProfile?.title || "",
                language: e.target.value as "en" | "fi",
              })
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="fi">Finnish (Suomi)</option>
          </select>
        </div>
      </section>

      {/* Data Section */}
      <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Database className="h-5 w-5 text-slate-600" />
          Data Management
        </h2>
        <div className="space-y-4">
          {/* Load Sample Data */}
          <div className="flex items-center justify-between rounded-lg border border-purple-100 bg-linear-to-r from-purple-50 to-blue-50 p-4">
            <div>
              <p className="font-medium text-purple-700">Load Sample Data</p>
              <p className="text-sm text-purple-600">
                Populate the app with demo resumes, cover letters, and jobs for
                testing
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleLoadSampleData}
              disabled={loadingMockData}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loadingMockData ? "Loading..." : "Load Demo"}
            </Button>
          </div>

          {/* Export Data */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-700">Export Data</p>
              <p className="text-sm text-slate-500">
                Download all your resumes, cover letters, and jobs
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Delete All Data */}
          <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-4">
            <div>
              <p className="font-medium text-red-700">Delete All Data</p>
              <p className="text-sm text-red-500">
                Permanently delete all your data
              </p>
            </div>
            <Button variant="danger" onClick={handleClearData}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="rounded-xl bg-slate-50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Your Stats
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{resumes.length}</p>
            <p className="text-sm text-slate-500">Resumes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {coverLetters.length}
            </p>
            <p className="text-sm text-slate-500">Cover Letters</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">{jobs.length}</p>
            <p className="text-sm text-slate-500">Jobs Tracked</p>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/Button";
import { Mail, Plus, Clock, Trash2, Edit, Copy } from "lucide-react";

export default function CoverLettersPage() {
  const { coverLetters, deleteCoverLetter, addCoverLetter } = useAppStore();

  const handleDuplicate = (id: string) => {
    const letter = coverLetters.find((l) => l.id === id);
    if (letter) {
      const newLetter = {
        ...letter,
        id: crypto.randomUUID(),
        title: `${letter.title} (Copy)`,
        // eslint-disable-next-line react-hooks/purity -- This is an event handler, not render-time code
        lastModified: Date.now(),
      };
      addCoverLetter(newLetter);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this cover letter?")) {
      deleteCoverLetter(id);
    }
  };

  const sortedLetters = [...coverLetters].sort(
    (a, b) => b.lastModified - a.lastModified
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Cover Letters</h1>
          <p className="mt-1 text-slate-500">Manage your cover letters</p>
        </div>
        <Link href="/cover-letters/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Cover Letter
          </Button>
        </Link>
      </div>

      {/* Cover Letters Grid */}
      {sortedLetters.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <Mail className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h2 className="mb-2 text-xl font-semibold text-slate-700">
            No cover letters yet
          </h2>
          <p className="mb-6 text-slate-500">Create your first cover letter</p>
          <Link href="/cover-letters/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Cover Letter
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedLetters.map((letter) => (
            <div
              key={letter.id}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Preview area */}
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                <Mail className="h-12 w-12 text-purple-400" />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="truncate font-semibold text-slate-800">
                  {letter.title || "Untitled Cover Letter"}
                </h3>
                <p className="truncate text-sm text-slate-500">
                  {letter.company} - {letter.jobTitle}
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {new Date(letter.lastModified).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
                <Link href={`/cover-letters/${letter.id}`} className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(letter.id)}
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(letter.id)}
                  title="Delete"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

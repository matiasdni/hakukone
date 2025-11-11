import { loadMockData } from "@/services/mockData";
import type {
  CoverLetter,
  JobApplication,
  ResumeData,
  UserProfile,
} from "@/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type { TemplateOverrides } from "@/lib/templates/types";

// Custom template type (stub for future feature)
export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  baseTemplateId: string;
  createdAt: number;
  updatedAt: number;
  overrides?: TemplateOverrides;
}

interface AppState {
  // Data
  resumes: ResumeData[];
  coverLetters: CoverLetter[];
  jobs: JobApplication[];
  userProfile: UserProfile | null;
  customTemplates: CustomTemplate[];

  // Active selections
  activeResumeId: string | null;
  activeCoverLetterId: string | null;

  // Resume Actions
  setResumes: (resumes: ResumeData[]) => void;
  addResume: (resume: ResumeData) => void;
  updateResume: (id: string, updates: Partial<ResumeData>) => void;
  deleteResume: (id: string) => void;
  setActiveResumeId: (id: string | null) => void;

  // Cover Letter Actions
  setCoverLetters: (letters: CoverLetter[]) => void;
  addCoverLetter: (letter: CoverLetter) => void;
  updateCoverLetter: (id: string, updates: Partial<CoverLetter>) => void;
  deleteCoverLetter: (id: string) => void;
  setActiveCoverLetterId: (id: string | null) => void;

  // Job Actions
  setJobs: (jobs: JobApplication[]) => void;
  addJob: (job: JobApplication) => void;
  updateJob: (id: string, updates: Partial<JobApplication>) => void;
  deleteJob: (id: string) => void;

  // Profile Actions
  setUserProfile: (profile: UserProfile | null) => void;

  // Custom Template Actions (stub for future feature)
  addCustomTemplate: (template: CustomTemplate) => void;
  updateCustomTemplate: (id: string, updates: Partial<CustomTemplate>) => void;
  deleteCustomTemplate: (id: string) => void;

  // Mock Data Actions
  loadSampleData: () => void;
  clearAllData: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        resumes: [],
        coverLetters: [],
        jobs: [],
        userProfile: null,
        customTemplates: [],
        activeResumeId: null,
        activeCoverLetterId: null,

        // Resume Actions
        setResumes: (resumes) => set({ resumes }),
        addResume: (resume) =>
          set((state) => ({
            resumes: [...state.resumes, resume],
          })),
        updateResume: (id, updates) =>
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === id ? { ...r, ...updates, lastModified: Date.now() } : r
            ),
          })),
        deleteResume: (id) =>
          set((state) => ({
            resumes: state.resumes.filter((r) => r.id !== id),
          })),
        setActiveResumeId: (id) => set({ activeResumeId: id }),

        // Cover Letter Actions
        setCoverLetters: (coverLetters) => set({ coverLetters }),
        addCoverLetter: (letter) =>
          set((state) => ({
            coverLetters: [...state.coverLetters, letter],
          })),
        updateCoverLetter: (id, updates) =>
          set((state) => ({
            coverLetters: state.coverLetters.map((l) =>
              l.id === id ? { ...l, ...updates, lastModified: Date.now() } : l
            ),
          })),
        deleteCoverLetter: (id) =>
          set((state) => ({
            coverLetters: state.coverLetters.filter((l) => l.id !== id),
          })),
        setActiveCoverLetterId: (id) => set({ activeCoverLetterId: id }),

        // Job Actions
        setJobs: (jobs) => set({ jobs }),
        addJob: (job) =>
          set((state) => ({
            jobs: [...state.jobs, job],
          })),
        updateJob: (id, updates) =>
          set((state) => ({
            jobs: state.jobs.map((j) =>
              j.id === id ? { ...j, ...updates } : j
            ),
          })),
        deleteJob: (id) =>
          set((state) => ({
            jobs: state.jobs.filter((j) => j.id !== id),
          })),

        // Profile Actions
        setUserProfile: (profile) => set({ userProfile: profile }),

        // Custom Template Actions (stub for future feature)
        addCustomTemplate: (template) =>
          set((state) => ({
            customTemplates: [...state.customTemplates, template],
          })),
        updateCustomTemplate: (id, updates) =>
          set((state) => ({
            customTemplates: state.customTemplates.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          })),
        deleteCustomTemplate: (id) =>
          set((state) => ({
            customTemplates: state.customTemplates.filter((t) => t.id !== id),
          })),

        // Mock Data Actions
        loadSampleData: () => {
          const mockData = loadMockData();
          set({
            resumes: mockData.resumes,
            coverLetters: mockData.coverLetters,
            jobs: mockData.jobs,
            userProfile: mockData.userProfile,
          });
        },
        clearAllData: () =>
          set({
            resumes: [],
            coverLetters: [],
            jobs: [],
            userProfile: null,
            customTemplates: [],
            activeResumeId: null,
            activeCoverLetterId: null,
          }),
      }),
      {
        name: "hakukone-storage",
        // Only persist data, not UI state like active IDs
        partialize: (state) => ({
          resumes: state.resumes,
          coverLetters: state.coverLetters,
          jobs: state.jobs,
          userProfile: state.userProfile,
        }),
      }
    ),
    { name: "HakukoneStore", enabled: process.env.NODE_ENV === "development" }
  )
);

// Stub for custom templates - feature not yet implemented
// Returns empty array for now, will be populated when custom template feature is built
export const useCustomTemplates = () =>
  [] as Array<{ id: string; name: string }>;

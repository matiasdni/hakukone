"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to fetch all resumes for the current user
 */
export function useResumes() {
  const trpc = useTRPC();
  return useQuery(trpc.resume.list.queryOptions());
}

/**
 * Hook to fetch a single resume by ID
 */
export function useResume(id: string) {
  const trpc = useTRPC();
  return useQuery(trpc.resume.getById.queryOptions({ id }));
}

/**
 * Hook to create a new resume (server generates ID)
 * Returns the server-generated ID for navigation
 */
export function useCreateResume() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.resume.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}

/**
 * Hook to save/update a resume
 */
export function useSaveResume() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.resume.upsert.mutationOptions(),
    onSuccess: () => {
      // Invalidate the resumes list to refetch
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}

/**
 * Hook to delete (archive) a resume
 */
export function useDeleteResume() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.resume.archive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}

/**
 * Hook to fetch design overrides for a resume
 */
export function useDesignOverrides(resumeId: string | undefined) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.design.get.queryOptions({ resumeId: resumeId ?? "" }),
    enabled: !!resumeId,
    // Prevent refetching when window regains focus - data is already in Zustand store
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to save design overrides
 * Note: We don't invalidate the query on success because the Zustand store
 * already has the latest data. This prevents the save → refetch → save loop.
 */
export function useSaveDesignOverrides() {
  const trpc = useTRPC();

  return useMutation({
    ...trpc.design.save.mutationOptions(),
    // No onSuccess invalidation - Zustand store is the source of truth for client state
  });
}

/**
 * Hook to fetch a single cover letter by ID
 */
export function useCoverLetter(id: string) {
  const trpc = useTRPC();
  return useQuery(trpc.coverLetter.getById.queryOptions({ id }));
}

/**
 * Hook to save/update a cover letter
 */
export function useSaveCoverLetter() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.coverLetter.upsert.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coverLetter"] });
    },
  });
}

/**
 * Hook to fetch all jobs for the current user
 */
export function useJobs() {
  const trpc = useTRPC();
  return useQuery(trpc.jobs.list.queryOptions());
}

/**
 * Hook to fetch a single job by ID
 */
export function useJob(id: string) {
  const trpc = useTRPC();
  return useQuery(trpc.jobs.getById.queryOptions({ id }));
}

/**
 * Hook to save/update a job
 */
export function useSaveJob() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.jobs.upsert.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

/**
 * Hook to delete a job
 */
export function useDeleteJob() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.jobs.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

/**
 * AI Hooks
 */

export function useAIRewrite() {
  const trpc = useTRPC();
  return useMutation(trpc.ai.rewrite.mutationOptions());
}

export function useMatchAnalysis() {
  const trpc = useTRPC();
  return useMutation(trpc.ai.matchAnalysis.mutationOptions());
}

export function useReviewResume() {
  const trpc = useTRPC();
  return useMutation(trpc.ai.reviewResume.mutationOptions());
}

export function useGenerateCoverLetter() {
  const trpc = useTRPC();
  return useMutation(trpc.ai.generateCoverLetter.mutationOptions());
}

export function useReviewCoverLetter() {
  const trpc = useTRPC();
  return useMutation(trpc.ai.reviewCoverLetter.mutationOptions());
}

export function useAIChat() {
  const trpc = useTRPC();
  return useMutation(trpc.ai.chat.mutationOptions());
}

export function useResearchCompany() {
  const trpc = useTRPC();
  return useMutation(trpc.ai.researchCompany.mutationOptions());
}

export function useCareerStrategy() {
  const trpc = useTRPC();
  return useMutation(trpc.ai.careerStrategy.mutationOptions());
}

"use client";

import { useAppStore } from "@/stores/useAppStore";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@stackframe/stack";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * StoreHydrator syncs server data to Zustand stores.
 * Design overrides are fetched on-demand by individual resume pages,
 * not prefetched here to avoid API spam.
 */
export function StoreHydrator() {
  const user = useUser();
  const setResumes = useAppStore((s) => s.setResumes);
  const trpc = useTRPC();

  const { data: resumes } = useQuery({
    ...trpc.resume.list.queryOptions(),
    enabled: !!user || process.env.NODE_ENV === "development",
  });

  useEffect(() => {
    if (resumes) {
      setResumes(resumes);
    }
  }, [resumes, setResumes]);

  return null;
}

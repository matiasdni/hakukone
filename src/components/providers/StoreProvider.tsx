"use client";

import { useSyncExternalStore } from "react";

// Use useSyncExternalStore for safe SSR/hydration detection
// This pattern is recommended by React 19 for detecting client-side mounting
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Provider component that prevents hydration mismatches when using
 * Zustand with persist middleware. It ensures the client-side state
 * is only rendered after the component has mounted.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore is the React 19 recommended pattern for this
  // We call it for hydration timing but don't need the value
  useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  // During SSR and initial hydration, render children normally
  // The store will use initial values, then rehydrate on client
  return <>{children}</>;
}

/**
 * Hook to check if the store has been hydrated from localStorage.
 * Use this to conditionally render content that depends on persisted state.
 */
export function useHydration() {
  // useSyncExternalStore is the safe way to detect client-side in React 19
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  return hydrated;
}

"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import React, { useMemo, useSyncExternalStore } from "react";

const PANEL_MIN_SIZE = 260;
const PANEL_DEFAULT_SIZE = 320;
const PANEL_MAX_SIZE = 450;
const STORAGE_KEY = "editor-panel-size";

// Convert pixels to percentage based on container width
function pxToPercent(px: number, containerWidth: number): number {
  return (px / containerWidth) * 100;
}

// Get window width for SSR-safe hook
function getWindowWidth() {
  return typeof window !== "undefined" ? window.innerWidth - 256 : 1200;
}

function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getServerSnapshot() {
  return 1200;
}

interface ResizableEditorLayoutProps {
  leftPanel: React.ReactNode;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  showRightPanel?: boolean;
}

/**
 * Resizable layout for the resume editor.
 * Makes the left content editor panel resizable.
 */
export function ResizableEditorLayout({
  leftPanel,
  children,
  rightPanel,
  showRightPanel = true,
}: ResizableEditorLayoutProps) {
  const containerWidth = useSyncExternalStore(
    subscribeToResize,
    getWindowWidth,
    getServerSnapshot
  );

  // Calculate default size from localStorage or default value
  const defaultSize = useMemo(() => {
    if (typeof window === "undefined") return 25;
    const savedSize = localStorage.getItem(STORAGE_KEY);
    if (savedSize) return parseFloat(savedSize);
    return pxToPercent(PANEL_DEFAULT_SIZE, containerWidth);
  }, [containerWidth]);

  // Calculate constraints as percentages
  const minSize = pxToPercent(PANEL_MIN_SIZE, containerWidth);
  const maxSize = pxToPercent(PANEL_MAX_SIZE, containerWidth);

  const handleResize = (sizes: number[]) => {
    if (sizes[0]) {
      localStorage.setItem(STORAGE_KEY, sizes[0].toString());
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={handleResize}
      className="flex-1"
    >
      <ResizablePanel
        defaultSize={defaultSize}
        minSize={minSize}
        maxSize={maxSize}
        className="overflow-y-auto border-r bg-slate-50"
      >
        <div className="p-3">{leftPanel}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={100 - defaultSize - (showRightPanel ? 20 : 0)}
      >
        <div className="flex h-full flex-col overflow-hidden">{children}</div>
      </ResizablePanel>
      {showRightPanel && rightPanel && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            {rightPanel}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

"use client";

import { clsx } from "clsx";
import { Wand2 } from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onAIImprove?: () => void;
  className?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  onAIImprove,
  className,
  placeholder,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<InstanceType<
    typeof import("quill").default
  > | null>(null);
  const isInitialized = useRef(false);
  const editorId = useId();
  const [isMounted, setIsMounted] = useState(false);

  // Track mounted state for SSR safety
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    // Don't initialize until mounted and ref is available
    if (!isMounted || !editorRef.current || isInitialized.current) return;

    // Dynamic import of Quill for SSR compatibility
    const initQuill = async () => {
      try {
        // Double-check ref is still valid
        if (!editorRef.current) return;

        // Check if already has a toolbar (double init protection)
        const existingToolbar =
          containerRef.current?.querySelector(".ql-toolbar");
        if (existingToolbar) return;

        isInitialized.current = true;
        const Quill = (await import("quill")).default;

        // Final check before initialization
        if (!editorRef.current) {
          isInitialized.current = false;
          return;
        }

        const quill = new Quill(editorRef.current, {
          theme: "snow",
          modules: {
            toolbar: [
              ["bold", "italic"],
              [{ list: "ordered" }, { list: "bullet" }],
            ],
          },
          placeholder: placeholder || "Type here...",
        });

        quill.on(
          "text-change",
          (_delta: unknown, _oldDelta: unknown, source: string) => {
            if (source === "user") {
              const html =
                editorRef.current?.querySelector(".ql-editor")?.innerHTML || "";
              onChange(html === "<p><br></p>" ? "" : html);
            }
          }
        );

        quillInstance.current = quill;

        // Set initial content
        if (value && value !== "<p><br></p>") {
          quill.clipboard.dangerouslyPasteHTML(value);
        }
      } catch (error) {
        console.error("Failed to initialize Quill:", error);
        isInitialized.current = false;
      }
    };

    initQuill();

    // Capture the container ref for cleanup
    const container = containerRef.current;

    // Cleanup on unmount
    return () => {
      if (quillInstance.current && container) {
        const toolbar = container.querySelector(".ql-toolbar");
        toolbar?.remove();
        quillInstance.current = null;
        isInitialized.current = false;
      }
    };
    // Note: We intentionally only depend on isMounted and editorId.
    // Adding onChange/placeholder/value would cause Quill to reinitialize on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, editorId]);

  // Sync external value changes
  useEffect(() => {
    if (quillInstance.current && editorRef.current) {
      const currentContent =
        editorRef.current.querySelector(".ql-editor")?.innerHTML || "";

      if (value !== currentContent) {
        if (value === "" && currentContent === "<p><br></p>") return;
        quillInstance.current.clipboard.dangerouslyPasteHTML(value);
      }
    }
  }, [value]);

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <div className="flex items-end justify-between">
        {label && (
          <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {label}
          </label>
        )}
        <div className="flex gap-1">
          {onAIImprove && (
            <button
              onClick={onAIImprove}
              className="flex items-center gap-1 text-xs font-medium text-purple-600 transition-colors hover:text-purple-700"
              title="Improve with AI"
              type="button"
            >
              <Wand2 className="h-3 w-3" /> AI Improve
            </button>
          )}
        </div>
      </div>
      <div ref={containerRef} className="rounded-lg bg-white shadow-sm">
        <div ref={editorRef} className="rounded-b-lg" />
      </div>
    </div>
  );
};

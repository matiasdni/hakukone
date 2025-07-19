"use client";

import React, { useEffect, useRef, useId } from "react";
import { Wand2 } from "lucide-react";
import { clsx } from "clsx";

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
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<InstanceType<
    typeof import("quill").default
  > | null>(null);
  const isInitialized = useRef(false);
  const editorId = useId();

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (isInitialized.current) return;

    // Dynamic import of Quill for SSR compatibility
    const initQuill = async () => {
      if (editorRef.current && !quillInstance.current) {
        // Check if already has a toolbar (double init protection)
        const existingToolbar =
          editorRef.current.parentElement?.querySelector(".ql-toolbar");
        if (existingToolbar) return;

        isInitialized.current = true;
        const Quill = (await import("quill")).default;

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

        if (value) {
          const currentContent =
            editorRef.current.querySelector(".ql-editor")?.innerHTML || "";
          if (
            value !== currentContent &&
            value !== "" &&
            currentContent !== "<p><br></p>"
          ) {
            quill.clipboard.dangerouslyPasteHTML(value);
          } else if (
            value &&
            (currentContent === "" || currentContent === "<p><br></p>")
          ) {
            quill.clipboard.dangerouslyPasteHTML(value);
          }
        }
      }
    };

    initQuill();

    // Copy ref value for cleanup (React hooks rule)
    const editorElement = editorRef.current;

    // Cleanup on unmount
    return () => {
      if (quillInstance.current) {
        // Remove toolbar if it exists
        const toolbar =
          editorElement?.parentElement?.querySelector(".ql-toolbar");
        toolbar?.remove();
        quillInstance.current = null;
        isInitialized.current = false;
      }
    };
    // Note: We intentionally only depend on editorId. Adding onChange/placeholder/value
    // would cause Quill to reinitialize on every change, breaking the editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorId]);
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
      <div className="rounded-lg bg-white shadow-sm">
        <div ref={editorRef} className="rounded-b-lg" />
      </div>
    </div>
  );
};

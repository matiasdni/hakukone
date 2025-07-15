"use client";

import { Card } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    Award,
    Briefcase,
    Check,
    ChevronDown,
    Code,
    FileText,
    GraduationCap,
    GripVertical,
    Languages,
    LayoutGrid,
    Pencil,
    Plus,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onAdd?: () => void;
  onDelete?: () => void;
  onTitleChange?: (newTitle: string) => void;
  addLabel?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  index: number;
  totalSections: number;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
  isEditable?: boolean;
}

export function CollapsibleSection({
  id,
  title,
  icon,
  children,
  onAdd,
  onDelete,
  onTitleChange,
  addLabel = "Add",
  isEmpty = false,
  emptyMessage = "No items added",
  index,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isEditable = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Sync title if it changes externally
  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const handleTitleSave = useCallback(() => {
    if (onTitleChange && editedTitle.trim() && editedTitle !== title) {
      onTitleChange(editedTitle.trim());
    }
    setIsEditingTitle(false);
  }, [editedTitle, title, onTitleChange]);

  const handleTitleCancel = useCallback(() => {
    setEditedTitle(title);
    setIsEditingTitle(false);
  }, [title]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTitleSave();
      } else if (e.key === "Escape") {
        handleTitleCancel();
      }
    },
    [handleTitleSave, handleTitleCancel]
  );

  return (
    <Card
      draggable={isDraggable}
      onDragStart={(e) => {
        if (!isDraggable) {
          e.preventDefault();
          return;
        }
        onDragStart(e, id);
      }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        "overflow-hidden transition-all duration-200",
        isDragging
          ? "border-dashed border-violet-400 opacity-50"
          : "border-slate-200 shadow-sm hover:shadow-md"
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Header - Always visible */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-3 transition-colors",
            isOpen
              ? "border-b border-slate-100 bg-slate-50/60"
              : "hover:bg-slate-50/60"
          )}
        >
          {/* Drag Handle */}
          <div
            className="cursor-grab rounded p-0.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
            onMouseEnter={() => setIsDraggable(true)}
            onMouseLeave={() => setIsDraggable(false)}
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Icon & Title */}
          <CollapsibleTrigger asChild>
            <button className="flex flex-1 items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/10 to-purple-500/10 text-violet-600 ring-1 ring-violet-200/50">
                {icon}
              </span>
              {isEditingTitle ? (
                <div
                  className="flex flex-1 items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={handleTitleSave}
                    className="h-7 flex-1 rounded-md border border-violet-300 bg-white px-2 text-sm font-semibold text-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTitleSave();
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-green-50 text-green-600 hover:bg-green-100"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTitleCancel();
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-semibold text-slate-700">
                    {title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform duration-200",
                      !isOpen && "-rotate-90"
                    )}
                  />
                </>
              )}
            </button>
          </CollapsibleTrigger>

          {/* Edit Title Button (for custom/editable sections) */}
          {isEditable && onTitleChange && !isEditingTitle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
              title="Edit Title"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}

          {/* Add Button (if applicable) */}
          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
                setIsOpen(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition-colors hover:bg-violet-100"
              title={addLabel}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Delete Button (for custom sections) */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100"
              title="Delete Section"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        <CollapsibleContent>
          <div className="p-3">
            {isEmpty ? (
              <p className="py-4 text-center text-xs text-slate-400">
                {emptyMessage}
              </p>
            ) : (
              children
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Section icon mapping
export const sectionIcons: Record<string, React.ReactNode> = {
  summary: <FileText className="h-4 w-4" />,
  experience: <Briefcase className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  skills: <Code className="h-4 w-4" />,
  certifications: <Award className="h-4 w-4" />,
  languages: <Languages className="h-4 w-4" />,
  custom: <LayoutGrid className="h-4 w-4" />,
};

// Compact item card for experience/education
interface ItemCardProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function ItemCard({ children, onDelete }: ItemCardProps) {
  return (
    <div className="group relative rounded-xl border border-slate-200/80 bg-linear-to-br from-white to-slate-50/50 p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      {children}
    </div>
  );
}

// Compact input for item cards
interface CompactInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CompactInput({
  label,
  value,
  onChange,
  placeholder,
  className,
}: CompactInputProps) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
        {label}
      </Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="h-9 border-slate-200 bg-white text-sm transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
      />
    </div>
  );
}

// Personal info header component
export function PersonalInfoHeader({
  fullName,
  title,
  email,
  phone,
  location,
  photoUrl,
  onChange,
}: {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  photoUrl?: string;
  onChange: (field: string, value: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange("photoUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    onChange("photoUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="mb-4 border-slate-200/80 bg-linear-to-br from-white via-slate-50/30 to-violet-50/20 p-4 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar with upload */}
        <div className="group relative">
          {photoUrl ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 ring-violet-500/20 ring-offset-2">
              <img
                src={photoUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
              <button
                onClick={handleRemovePhoto}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                title="Remove photo"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-slate-100 to-slate-50 ring-2 ring-slate-200/50 transition-all hover:from-violet-50 hover:to-purple-50 hover:ring-violet-200/50"
              title="Upload photo"
            >
              <Upload className="h-5 w-5 text-slate-400" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <Input
            type="text"
            value={fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Your Name"
            className="mb-1 h-auto border-none bg-transparent p-0 text-lg font-bold text-slate-800 shadow-none placeholder:text-slate-300 focus-visible:ring-0"
          />
          <Input
            type="text"
            value={title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Professional Title"
            className="h-auto border-none bg-transparent p-0 text-sm text-slate-500 shadow-none placeholder:text-slate-300 focus-visible:ring-0"
          />
        </div>

        {/* Toggle more */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Expanded contact info */}
      {isExpanded && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <CompactInput
            label="Email"
            value={email}
            onChange={(v) => onChange("email", v)}
          />
          <CompactInput
            label="Phone"
            value={phone}
            onChange={(v) => onChange("phone", v)}
          />
          <CompactInput
            label="Location"
            value={location}
            onChange={(v) => onChange("location", v)}
            className="col-span-2"
          />
        </div>
      )}
    </Card>
  );
}

"use client";

import { CompactInput, ItemCard } from "@/components/editor/EditorComponents";
import { DatePicker } from "@/components/ui/date-picker";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import type {
  CustomItem,
  CustomSection,
  Education,
  Experience,
  Language,
} from "@/types";
import { Wand2, X } from "lucide-react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

// ============================================
// Debounce Hook for Form State Sync
// ============================================

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const callbackRef = useRef(callback);

  // Keep callback reference updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;
}

// ============================================
// Summary Section Form
// ============================================

interface SummarySectionFormProps {
  value: string;
  onChange: (value: string) => void;
  onRewriteWithAI?: (field: string, content: string) => void;
}

export const SummarySectionForm = memo(function SummarySectionForm({
  value,
  onChange,
  onRewriteWithAI,
}: SummarySectionFormProps) {
  // Local state for immediate updates
  const [localValue, setLocalValue] = useState(value);

  // Sync from parent when external changes occur
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced sync to parent
  const debouncedOnChange = useDebouncedCallback(onChange, 300);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      debouncedOnChange(newValue);
    },
    [debouncedOnChange]
  );

  return (
    <div className="space-y-2">
      {onRewriteWithAI && (
        <div className="flex justify-end">
          <button
            onClick={() => onRewriteWithAI("summary", localValue)}
            className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600 hover:bg-purple-100"
          >
            <Wand2 className="h-3 w-3" /> Enhance
          </button>
        </div>
      )}
      <RichTextEditor
        value={localValue}
        onChange={handleChange}
        placeholder="Write a compelling summary..."
      />
    </div>
  );
});

// ============================================
// Experience Item Form
// ============================================

interface ExperienceItemFormProps {
  experience: Experience;
  onUpdate: (updates: Partial<Experience>) => void;
  onDelete: () => void;
}

export const ExperienceItemForm = memo(function ExperienceItemForm({
  experience,
  onUpdate,
  onDelete,
}: ExperienceItemFormProps) {
  // Local state for all fields
  const [localExp, setLocalExp] = useState(experience);

  // Sync from parent
  useEffect(() => {
    setLocalExp(experience);
  }, [experience]);

  // Debounced sync to parent
  const debouncedUpdate = useDebouncedCallback(onUpdate, 300);

  const handleFieldChange = useCallback(
    (field: keyof Experience, value: string | boolean) => {
      setLocalExp((prev) => ({ ...prev, [field]: value }));
      debouncedUpdate({ [field]: value });
    },
    [debouncedUpdate]
  );

  return (
    <ItemCard onDelete={onDelete}>
      <div className="grid grid-cols-2 gap-2">
        <CompactInput
          label="Role"
          value={localExp.role}
          onChange={(v) => handleFieldChange("role", v)}
        />
        <CompactInput
          label="Company"
          value={localExp.company}
          onChange={(v) => handleFieldChange("company", v)}
        />
        <div className="space-y-0.5">
          <label className="block text-[10px] font-medium tracking-wider text-slate-400 uppercase">
            Start
          </label>
          <DatePicker
            value={localExp.startDate}
            onChange={(v) => handleFieldChange("startDate", v)}
            placeholder="Jan 2020"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-0.5">
            <label className="block text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              End
            </label>
            {localExp.current ? (
              <div className="flex h-8 items-center rounded-md border border-slate-700 bg-slate-800/50 px-2 text-sm text-slate-400">
                Present
              </div>
            ) : (
              <DatePicker
                value={localExp.endDate}
                onChange={(v) => handleFieldChange("endDate", v)}
                placeholder="Present"
              />
            )}
          </div>
          <label className="mb-1.5 flex items-center gap-1 text-[10px] text-slate-400">
            <input
              type="checkbox"
              checked={localExp.current}
              onChange={(e) => handleFieldChange("current", e.target.checked)}
              className="h-3 w-3 rounded"
            />
            Now
          </label>
        </div>
      </div>
      <div className="mt-2">
        <label className="mb-0.5 block text-[10px] font-medium tracking-wider text-slate-400 uppercase">
          Description
        </label>
        <RichTextEditor
          value={localExp.description}
          onChange={(v) => handleFieldChange("description", v)}
          placeholder="Key achievements..."
        />
      </div>
    </ItemCard>
  );
});

// ============================================
// Experience Section Form
// ============================================

interface ExperienceSectionFormProps {
  experiences: Experience[];
  onUpdate: (expId: string, updates: Partial<Experience>) => void;
  onDelete: (expId: string) => void;
}

export const ExperienceSectionForm = memo(function ExperienceSectionForm({
  experiences,
  onUpdate,
  onDelete,
}: ExperienceSectionFormProps) {
  return (
    <div className="space-y-2">
      {experiences.map((exp) => (
        <ExperienceItemForm
          key={exp.id}
          experience={exp}
          onUpdate={(updates) => onUpdate(exp.id, updates)}
          onDelete={() => onDelete(exp.id)}
        />
      ))}
    </div>
  );
});

// ============================================
// Education Item Form
// ============================================

interface EducationItemFormProps {
  education: Education;
  onUpdate: (updates: Partial<Education>) => void;
  onDelete: () => void;
}

export const EducationItemForm = memo(function EducationItemForm({
  education,
  onUpdate,
  onDelete,
}: EducationItemFormProps) {
  const [localEdu, setLocalEdu] = useState(education);

  useEffect(() => {
    setLocalEdu(education);
  }, [education]);

  const debouncedUpdate = useDebouncedCallback(onUpdate, 300);

  const handleFieldChange = useCallback(
    (field: keyof Education, value: string) => {
      setLocalEdu((prev) => ({ ...prev, [field]: value }));
      debouncedUpdate({ [field]: value });
    },
    [debouncedUpdate]
  );

  return (
    <ItemCard onDelete={onDelete}>
      <div className="grid grid-cols-3 gap-2">
        <CompactInput
          label="School"
          value={localEdu.school}
          onChange={(v) => handleFieldChange("school", v)}
        />
        <CompactInput
          label="Degree"
          value={localEdu.degree}
          onChange={(v) => handleFieldChange("degree", v)}
        />
        <div className="space-y-0.5">
          <label className="block text-[10px] font-medium tracking-wider text-slate-400 uppercase">
            Year
          </label>
          <DatePicker
            value={localEdu.year}
            onChange={(v) => handleFieldChange("year", v)}
            placeholder="2024"
          />
        </div>
      </div>
    </ItemCard>
  );
});

// ============================================
// Education Section Form
// ============================================

interface EducationSectionFormProps {
  education: Education[];
  onUpdate: (eduId: string, updates: Partial<Education>) => void;
  onDelete: (eduId: string) => void;
}

export const EducationSectionForm = memo(function EducationSectionForm({
  education,
  onUpdate,
  onDelete,
}: EducationSectionFormProps) {
  return (
    <div className="space-y-2">
      {education.map((edu) => (
        <EducationItemForm
          key={edu.id}
          education={edu}
          onUpdate={(updates) => onUpdate(edu.id, updates)}
          onDelete={() => onDelete(edu.id)}
        />
      ))}
    </div>
  );
});

// ============================================
// Skills Section Form
// ============================================

interface SkillsSectionFormProps {
  skills: string[];
  onUpdate: (skills: string[]) => void;
}

export const SkillsSectionForm = memo(function SkillsSectionForm({
  skills,
  onUpdate,
}: SkillsSectionFormProps) {
  const [inputValue, setInputValue] = useState("");

  const handleRemoveSkill = useCallback(
    (index: number) => {
      onUpdate(skills.filter((_, i) => i !== index));
    },
    [skills, onUpdate]
  );

  const handleAddSkill = useCallback(
    (value: string) => {
      const trimmed = value.trim().replace(/,$/, "");
      if (trimmed && !skills.includes(trimmed)) {
        onUpdate([...skills, trimmed]);
        setInputValue("");
      }
    },
    [skills, onUpdate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        handleAddSkill(inputValue);
      }
    },
    [inputValue, handleAddSkill]
  );

  const handleBlur = useCallback(() => {
    if (inputValue.trim()) {
      handleAddSkill(inputValue);
    }
  }, [inputValue, handleAddSkill]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
          >
            {skill}
            <button
              onClick={() => handleRemoveSkill(idx)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Type skill + Enter"
        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
      />
    </div>
  );
});

// ============================================
// Language Item Form
// ============================================

interface LanguageItemFormProps {
  language: Language;
  onUpdate: (updates: Partial<Language>) => void;
  onDelete: () => void;
}

export const LanguageItemForm = memo(function LanguageItemForm({
  language,
  onUpdate,
  onDelete,
}: LanguageItemFormProps) {
  const [localLang, setLocalLang] = useState(language);

  useEffect(() => {
    setLocalLang(language);
  }, [language]);

  const debouncedUpdate = useDebouncedCallback(onUpdate, 300);

  const handleNameChange = useCallback(
    (value: string) => {
      setLocalLang((prev) => ({ ...prev, name: value }));
      debouncedUpdate({ name: value });
    },
    [debouncedUpdate]
  );

  const handleLevelChange = useCallback(
    (level: Language["level"]) => {
      setLocalLang((prev) => ({ ...prev, level }));
      onUpdate({ level }); // Level changes don't need debouncing
    },
    [onUpdate]
  );

  return (
    <ItemCard onDelete={onDelete}>
      <div className="grid grid-cols-2 gap-2">
        <CompactInput
          label="Language"
          value={localLang.name}
          onChange={handleNameChange}
        />
        <div>
          <label className="mb-0.5 block text-[10px] font-medium tracking-wider text-slate-400 uppercase dark:text-slate-500">
            Level
          </label>
          <select
            value={localLang.level}
            onChange={(e) =>
              handleLevelChange(e.target.value as Language["level"])
            }
            className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            <option value="Native">Native</option>
            <option value="Fluent">Fluent</option>
            <option value="Proficient">Proficient</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Basic">Basic</option>
          </select>
        </div>
      </div>
    </ItemCard>
  );
});

// ============================================
// Languages Section Form
// ============================================

interface LanguagesSectionFormProps {
  languages: Language[];
  onUpdate: (langId: string, updates: Partial<Language>) => void;
  onDelete: (langId: string) => void;
}

export const LanguagesSectionForm = memo(function LanguagesSectionForm({
  languages,
  onUpdate,
  onDelete,
}: LanguagesSectionFormProps) {
  return (
    <div className="space-y-2">
      {languages.map((lang) => (
        <LanguageItemForm
          key={lang.id}
          language={lang}
          onUpdate={(updates) => onUpdate(lang.id, updates)}
          onDelete={() => onDelete(lang.id)}
        />
      ))}
    </div>
  );
});

// ============================================
// Custom Item Form
// ============================================

interface CustomItemFormProps {
  item: CustomItem;
  onUpdate: (updates: Partial<CustomItem>) => void;
  onDelete: () => void;
}

export const CustomItemForm = memo(function CustomItemForm({
  item,
  onUpdate,
  onDelete,
}: CustomItemFormProps) {
  // Use item.id as key in parent to reset state when ID changes
  const [localItem, setLocalItem] = useState(item);

  const debouncedUpdate = useDebouncedCallback(onUpdate, 300);

  const handleFieldChange = useCallback(
    (field: keyof CustomItem, value: string) => {
      setLocalItem((prev) => {
        const updated = { ...prev, [field]: value };
        return updated;
      });
      debouncedUpdate({ [field]: value });
    },
    [debouncedUpdate]
  );

  return (
    <ItemCard onDelete={onDelete}>
      <div className="grid grid-cols-2 gap-2">
        <CompactInput
          label="Title"
          value={localItem.title}
          onChange={(v) => handleFieldChange("title", v)}
        />
        <CompactInput
          label="Subtitle"
          value={localItem.subtitle}
          onChange={(v) => handleFieldChange("subtitle", v)}
        />
        <CompactInput
          label="Date"
          value={localItem.date}
          onChange={(v) => handleFieldChange("date", v)}
          className="col-span-2"
        />
      </div>
      <div className="mt-2">
        <label className="mb-0.5 block text-[10px] font-medium tracking-wider text-slate-400 uppercase">
          Description
        </label>
        <RichTextEditor
          value={localItem.description}
          onChange={(v) => handleFieldChange("description", v)}
          placeholder="Details..."
        />
      </div>
    </ItemCard>
  );
});

// ============================================
// Custom Section Form
// ============================================

interface CustomSectionFormProps {
  section: CustomSection;
  onUpdateItem: (itemId: string, updates: Partial<CustomItem>) => void;
  onDeleteItem: (itemId: string) => void;
}

export const CustomSectionForm = memo(function CustomSectionForm({
  section,
  onUpdateItem,
  onDeleteItem,
}: CustomSectionFormProps) {
  return (
    <div className="space-y-2">
      {section.items.map((item) => (
        <CustomItemForm
          key={item.id}
          item={item}
          onUpdate={(updates) => onUpdateItem(item.id, updates)}
          onDelete={() => onDeleteItem(item.id)}
        />
      ))}
    </div>
  );
});

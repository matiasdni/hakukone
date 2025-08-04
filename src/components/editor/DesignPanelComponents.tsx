"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider as UISlider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// ==================== ACCORDION COMPONENT ====================

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({
  title,
  icon,
  children,
  defaultOpen = false,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-slate-50/80">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/10 to-purple-500/10 text-violet-600 ring-1 ring-violet-200/50">
              {icon}
            </span>
            <span className="flex-1 text-xs font-semibold tracking-[0.08em] text-slate-700 uppercase">
              {title}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="border-t border-slate-100 pt-4 pb-4">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ==================== SLIDER COMPONENT ====================

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

/**
 * Slider with debouncing for smooth performance
 */
export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
}: SliderProps) {
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local value when prop changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange handler
  const handleChange = useCallback(
    (newValue: number) => {
      setLocalValue(newValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, 30); // 30ms debounce for smooth slider
    },
    [onChange]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-slate-600">{label}</Label>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 tabular-nums">
          {step < 1 ? localValue.toFixed(1) : localValue}
          {unit}
        </span>
      </div>
      <UISlider
        value={localValue}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        onChange={(e) => handleChange(Number(e.target.value))}
        showValue={false}
        className="accent-violet-600"
      />
    </div>
  );
}

// ==================== COLOR PICKER ROW ====================

interface ColorPickerRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Color picker with debouncing to prevent lag during rapid color selection
 */
export function ColorPickerRow({
  label,
  value,
  onChange,
}: ColorPickerRowProps) {
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local value when prop changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange handler
  const debouncedOnChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, 50); // 50ms debounce for smooth color picker
    },
    [onChange]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 transition-colors hover:border-slate-300">
        <div className="relative">
          <input
            type="color"
            value={localValue}
            onChange={(e) => debouncedOnChange(e.target.value)}
            className="h-6 w-6 cursor-pointer rounded-md border-0 bg-transparent p-0"
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-slate-200"
            style={{ backgroundColor: localValue }}
          />
        </div>
        <Input
          type="text"
          value={localValue}
          onChange={(e) => debouncedOnChange(e.target.value)}
          className="h-7 flex-1 border-0 bg-transparent px-1 font-mono text-xs text-slate-600 shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

// ==================== TOGGLE GROUP ====================

interface ToggleGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
}

export function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 3,
}: ToggleGroupProps<T>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      <div
        className={cn(
          "grid gap-1.5",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-4"
        )}
      >
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-lg border px-2.5 py-2 text-[11px] font-medium capitalize transition-all duration-150",
              value === option
                ? "border-violet-500/40 bg-linear-to-br from-violet-50 to-purple-50 text-violet-700 shadow-sm ring-1 ring-violet-200/50"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            {option.replace(/-/g, " ")}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== CHECKBOX ROW ====================

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxRow({ label, checked, onChange }: CheckboxRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-slate-300">
      <Label className="text-xs font-medium text-slate-700">{label}</Label>
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
    </div>
  );
}

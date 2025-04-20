"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

interface DatePickerProps {
  value?: string; // ISO date string or "MM/YYYY" format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  monthOnly?: boolean; // For experience/education dates that only need month/year
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  monthOnly = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse the value to a Date object
  const parsedDate = React.useMemo(() => {
    if (!value) return undefined;

    // Try parsing as "MM/YYYY" for month-only format
    if (monthOnly) {
      const parsed = parse(value, "MM/yyyy", new Date());
      if (isValid(parsed)) return parsed;
      // Also try "MMM yyyy" format
      const parsed2 = parse(value, "MMM yyyy", new Date());
      if (isValid(parsed2)) return parsed2;
    }

    // Try ISO date format
    const isoDate = new Date(value);
    if (isValid(isoDate)) return isoDate;

    return undefined;
  }, [value, monthOnly]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      if (monthOnly) {
        onChange(format(date, "MMM yyyy"));
      } else {
        onChange(format(date, "yyyy-MM-dd"));
      }
    }
    setOpen(false);
  };

  const displayValue = React.useMemo(() => {
    if (!parsedDate) return value || "";
    if (monthOnly) {
      return format(parsedDate, "MMM yyyy");
    }
    return format(parsedDate, "PPP");
  }, [parsedDate, value, monthOnly]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm transition-colors hover:border-slate-300 focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-slate-400",
            className
          )}
        >
          <span className="truncate">{displayValue || placeholder}</span>
          <CalendarIcon className="h-4 w-4 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border border-slate-200 bg-white p-0 shadow-lg"
        align="start"
      >
        <Calendar
          mode="single"
          selected={parsedDate}
          onSelect={handleSelect}
          defaultMonth={parsedDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangeInputProps {
  startValue?: string;
  endValue?: string;
  isCurrent?: boolean;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onCurrentChange?: (isCurrent: boolean) => void;
  className?: string;
}

export function DateRangeInput({
  startValue,
  endValue,
  isCurrent = false,
  onStartChange,
  onEndChange,
  onCurrentChange,
  className,
}: DateRangeInputProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DatePicker
        value={startValue}
        onChange={onStartChange}
        placeholder="Start date"
        monthOnly
        className="flex-1"
      />
      <span className="text-slate-400">—</span>
      {isCurrent ? (
        <div className="flex h-9 flex-1 items-center justify-center rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-600">
          Present
        </div>
      ) : (
        <DatePicker
          value={endValue}
          onChange={onEndChange}
          placeholder="End date"
          monthOnly
          className="flex-1"
        />
      )}
      {onCurrentChange && (
        <label className="flex cursor-pointer items-center gap-1.5 text-xs whitespace-nowrap text-slate-500">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => onCurrentChange(e.target.checked)}
            className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          Current
        </label>
      )}
    </div>
  );
}

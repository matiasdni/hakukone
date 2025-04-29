"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export type SwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <label className="relative inline-flex cursor-pointer items-center">
      <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
      <div
        className={cn(
          "h-5 w-9 rounded-full bg-slate-200 transition-colors duration-200",
          "peer-checked:bg-violet-600",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-violet-300 peer-focus-visible:ring-offset-2",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          className
        )}
      />
      <span 
        className={cn(
          "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          "peer-checked:translate-x-4"
        )}
      />
    </label>
  )
);
Switch.displayName = "Switch";

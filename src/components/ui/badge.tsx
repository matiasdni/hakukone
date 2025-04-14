"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "muted" | "gradient" | "success" | "warning" | "danger";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: 
        "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
      secondary: 
        "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
      outline:
        "border border-slate-200 bg-white text-slate-700 dark:border-white/20 dark:bg-transparent dark:text-slate-300",
      muted: 
        "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400",
      gradient:
        "bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-sm",
      success:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
      warning:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
      danger:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

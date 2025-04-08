import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "h-10 w-full min-w-0 rounded-xl border bg-white px-4 py-2 text-base text-slate-900 shadow-sm transition-all duration-200",
        // Border styling
        "border-slate-200 hover:border-slate-300",
        // Focus states
        "focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 focus:outline-none",
        // Dark mode
        "dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-white/20 dark:focus:border-violet-500 dark:focus:ring-violet-500/20",
        // Placeholder
        "placeholder:text-slate-400",
        // File input
        "file:mr-4 file:h-full file:border-0 file:bg-violet-50 file:px-4 file:text-sm file:font-medium file:text-violet-700 dark:file:bg-violet-500/20 dark:file:text-violet-400",
        // Selection
        "selection:bg-violet-100 selection:text-violet-900 dark:selection:bg-violet-500/30",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800",
        // Error state
        "aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20 dark:aria-invalid:border-red-500 dark:aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };

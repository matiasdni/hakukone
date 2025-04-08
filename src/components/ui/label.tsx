"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-xs font-medium tracking-wide text-slate-600",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };

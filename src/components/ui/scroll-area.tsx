"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    const overflow =
      orientation === "both"
        ? "overflow-auto"
        : orientation === "horizontal"
          ? "overflow-x-auto"
          : "overflow-y-auto";

    return (
      <div
        ref={ref}
        className={cn("relative", "scroll-area", overflow, className)}
        {...props}
      />
    );
  }
);
ScrollArea.displayName = "ScrollArea";

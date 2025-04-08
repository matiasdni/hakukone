"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "gradient-border";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "rounded-2xl border border-slate-200/80 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900/80",
      glass:
        "rounded-2xl border border-white/20 bg-white/80 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80",
      elevated:
        "rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 dark:border-white/5 dark:bg-slate-900 dark:shadow-slate-950/50",
      "gradient-border":
        "relative rounded-2xl bg-white p-px dark:bg-slate-900 before:absolute before:inset-0 before:rounded-2xl before:bg-linear-to-br before:from-violet-500 before:via-purple-500 before:to-fuchsia-500 before:p-px before:content-['']",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-200",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-1.5 border-b border-slate-100/50 px-5 py-4 dark:border-white/5",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-base font-semibold text-slate-900 dark:text-white", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-slate-500 dark:text-slate-400", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-5 py-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center border-t border-slate-100/50 px-5 py-4 dark:border-white/5",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };


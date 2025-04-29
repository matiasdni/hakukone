"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  showValue?: boolean;
  unit?: string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, showValue = true, unit = "", ...props }, ref) => {
    const value =
      typeof props.value === "number"
        ? props.value
        : typeof props.value === "string"
          ? Number(props.value)
          : undefined;

    return (
      <div className="space-y-1">
        {showValue && value !== undefined && (
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span className="truncate">{props["aria-label"]}</span>
            <span className="text-slate-700">
              {value}
              {unit}
            </span>
          </div>
        )}
        <input
          ref={ref}
          type="range"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600",
            "[-webkit-slider-thumb:appearance-none] [-webkit-slider-thumb:background:#1d4ed8] [-webkit-slider-thumb:border-radius:9999px] [-webkit-slider-thumb:border:2px_solid_white] [-webkit-slider-thumb:box-shadow:0_3px_10px_rgba(0,0,0,0.12)] [-webkit-slider-thumb:height:14px] [-webkit-slider-thumb:width:14px]",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

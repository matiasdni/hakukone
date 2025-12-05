"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDesign } from "@/contexts/DesignContext";
import { templateRegistry } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { memo, useCallback } from "react";

/**
 * Theme gallery for selecting resume templates
 */
export const ThemeGallery = memo(function ThemeGallery() {
  const { templateId, setTemplateId } = useDesign();
  const templates = templateRegistry.getAll();

  const handleSelect = useCallback(
    (newTemplateId: string) => {
      setTemplateId(newTemplateId);
    },
    [setTemplateId]
  );

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {templates.map((template) => {
        const isSelected = templateId === template.id;

        return (
          <Card
            key={template.id}
            className={cn(
              "relative cursor-pointer overflow-hidden transition-all hover:shadow-lg",
              isSelected && "ring-primary ring-2"
            )}
            onClick={() => handleSelect(template.id)}
          >
            {isSelected && (
              <div className="bg-primary text-primary-foreground absolute top-2 right-2 z-10 rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            <CardContent className="p-3">
              {/* Template preview thumbnail */}
              <div
                className="mb-2 flex aspect-210/297 items-center justify-center rounded border bg-white"
                style={{
                  background: template.colors.background,
                  borderColor: template.colors.border,
                }}
              >
                <div className="p-2 text-center text-xs">
                  <div
                    className="mb-1 font-bold"
                    style={{ color: template.colors.primary }}
                  >
                    {template.name}
                  </div>
                  <div
                    className="text-[8px]"
                    style={{ color: template.colors.mutedText }}
                  >
                    {template.description}
                  </div>
                </div>
              </div>
              <p className="text-center text-sm font-medium">{template.name}</p>
              <div className="mt-1 flex flex-wrap justify-center gap-1">
                {template.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted rounded px-1.5 py-0.5 text-[10px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

export default ThemeGallery;

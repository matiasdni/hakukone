"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDesign } from "@/contexts/DesignContext";
import { memo } from "react";
import { FontSelector } from "../FontSelector";

/**
 * Customize tab for the design panel
 * Allows users to customize typography, colors, and layout
 */
export const CustomizeTab = memo(function CustomizeTab() {
  const { values, updateTypography, updateLayout, updateColors } = useDesign();

  return (
    <div className="space-y-6 p-4">
      <Tabs defaultValue="typography" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="typography" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Base Font</Label>
            <FontSelector
              value={values.font}
              onChange={(font) =>
                updateTypography({
                  baseFontFamily: font as
                    | "inter"
                    | "source-sans"
                    | "merriweather"
                    | "lora"
                    | "jetbrains-mono",
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Name Size: {values.nameSize}px</Label>
            <Slider
              value={values.nameSize}
              min={20}
              max={48}
              step={1}
              aria-label="Name size"
              onChange={(e) => {
                const size = Number((e.target as HTMLInputElement).value);
                updateTypography({ name: { fontSize: size } });
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="colors" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <input
              type="color"
              value={values.primaryColor}
              onChange={(e) => updateColors({ primary: e.target.value })}
              className="h-10 w-full cursor-pointer rounded"
            />
          </div>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <input
              type="color"
              value={values.textColor}
              onChange={(e) => updateColors({ text: e.target.value })}
              className="h-10 w-full cursor-pointer rounded"
            />
          </div>
        </TabsContent>

        <TabsContent value="layout" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Section Gap: {values.sectionGap}px</Label>
            <Slider
              value={values.sectionGap}
              min={8}
              max={48}
              step={2}
              aria-label="Section gap"
              onChange={(e) => {
                const gap = Number((e.target as HTMLInputElement).value);
                updateLayout({ sectionGap: gap });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Item Gap: {values.itemGap}px</Label>
            <Slider
              value={values.itemGap}
              min={4}
              max={24}
              step={2}
              aria-label="Item gap"
              onChange={(e) => {
                const gap = Number((e.target as HTMLInputElement).value);
                updateLayout({ itemGap: gap });
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default CustomizeTab;

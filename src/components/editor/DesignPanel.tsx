"use client";

import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDesign } from "@/contexts/DesignContext";
import { Redo, Undo } from "lucide-react";
import { memo } from "react";
import { CustomizeTab } from "./design/CustomizeTab";
import { ThemeGallery } from "./design/ThemeGallery";

export const DesignPanel = memo(function DesignPanel() {
  const { undo, redo, canUndo, canRedo } = useDesign();

  return (
    <div className="flex h-full flex-col bg-slate-50/50 dark:bg-slate-900/50">
      <Tabs defaultValue="themes" className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={undo}
                  disabled={!canUndo}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={redo}
                  disabled={!canRedo}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="themes" className="m-0 h-full border-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <ThemeGallery />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="customize" className="m-0 h-full border-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <CustomizeTab />
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
});

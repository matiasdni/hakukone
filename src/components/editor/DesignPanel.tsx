"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDesign } from "@/contexts/DesignContext";
import { templateRegistry } from "@/lib/templates";
import { useCustomTemplates } from "@/stores/useAppStore";
import { clsx } from "clsx";
import {
  Columns,
  Heading,
  Image,
  Languages,
  Layout,
  Palette,
  SlidersHorizontal,
  Tag,
  Type,
  User,
} from "lucide-react";
import { memo } from "react";
import {
  Accordion,
  CheckboxRow,
  ColorPickerRow,
  Slider,
  ToggleGroup,
} from "./DesignPanelComponents";
import { FontSelector } from "./FontSelector";

// Color presets
const colorPresets = [
  { name: "Blue", primary: "#2563eb" },
  { name: "Purple", primary: "#7c3aed" },
  { name: "Teal", primary: "#0d9488" },
  { name: "Green", primary: "#16a34a" },
  { name: "Red", primary: "#dc2626" },
  { name: "Orange", primary: "#ea580c" },
  { name: "Pink", primary: "#db2777" },
  { name: "Slate", primary: "#475569" },
];

// ============================================
// Accordion Sections - Memoized for Performance
// ============================================

const TemplateSection = memo(function TemplateSection() {
  const { templateId, setTemplateId } = useDesign();
  const customTemplates = useCustomTemplates();
  const builtInTemplates = templateRegistry.getBuiltIn();

  return (
    <Accordion
      title="Template"
      icon={<Layout className="h-3.5 w-3.5" />}
      defaultOpen
    >
      <div className="grid grid-cols-2 gap-2">
        {builtInTemplates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            className={clsx(
              "group flex flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
              templateId === t.id
                ? "border-violet-500/40 bg-linear-to-br from-violet-50 to-purple-50 shadow-sm ring-1 ring-violet-200/50"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <span
              className={clsx(
                "text-xs font-semibold",
                templateId === t.id ? "text-violet-700" : "text-slate-800"
              )}
            >
              {t.name}
            </span>
            <Badge
              variant="muted"
              className="w-fit bg-slate-100 text-slate-500"
            >
              Built-in
            </Badge>
          </button>
        ))}
        {customTemplates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            className={clsx(
              "group flex flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
              templateId === t.id
                ? "border-violet-500/40 bg-linear-to-br from-violet-50 to-purple-50 shadow-sm ring-1 ring-violet-200/50"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <span
              className={clsx(
                "text-xs font-semibold",
                templateId === t.id ? "text-violet-700" : "text-slate-800"
              )}
            >
              {t.name}
            </span>
            <Badge
              variant="outline"
              className="w-fit border-purple-200 bg-purple-50 text-purple-600"
            >
              Custom
            </Badge>
          </button>
        ))}
      </div>
    </Accordion>
  );
});

const HeaderSection = memo(function HeaderSection() {
  const { values, updateHeader } = useDesign();
  const {
    headerLayout,
    headerContactLayout,
    headerShowContactIcons,
    headerShowDivider,
  } = values;

  return (
    <Accordion title="Header" icon={<User className="h-3.5 w-3.5" />}>
      <div className="space-y-3">
        <ToggleGroup
          label="Layout"
          options={["left", "center", "split"] as const}
          value={headerLayout}
          onChange={(value) => updateHeader({ layout: value })}
        />
        <ToggleGroup
          label="Contact"
          options={["inline", "stacked", "grid"] as const}
          value={headerContactLayout}
          onChange={(value) => updateHeader({ contactLayout: value })}
        />
        <CheckboxRow
          label="Show Icons"
          checked={headerShowContactIcons}
          onChange={(checked) => updateHeader({ showContactIcons: checked })}
        />
        <CheckboxRow
          label="Divider"
          checked={headerShowDivider}
          onChange={(checked) => updateHeader({ showDivider: checked })}
        />
      </div>
    </Accordion>
  );
});

const PhotoSection = memo(function PhotoSection() {
  const { values, updatePhoto } = useDesign();
  const { photoShow, photoSize, photoShape, photoPosition } = values;

  return (
    <Accordion title="Photo" icon={<Image className="h-3.5 w-3.5" />}>
      <div className="space-y-3">
        <CheckboxRow
          label="Show Photo"
          checked={photoShow}
          onChange={(checked) => updatePhoto({ show: checked })}
        />
        {photoShow && (
          <>
            <Slider
              label="Size"
              value={photoSize}
              min={40}
              max={120}
              step={4}
              onChange={(value) => updatePhoto({ size: value })}
            />
            <ToggleGroup
              label="Shape"
              options={["circle", "rounded", "square"] as const}
              value={photoShape}
              onChange={(value) => updatePhoto({ shape: value })}
            />
            <ToggleGroup
              label="Position"
              options={["left", "center", "right"] as const}
              value={photoPosition}
              onChange={(value) => updatePhoto({ position: value })}
            />
          </>
        )}
      </div>
    </Accordion>
  );
});

const ColorsSection = memo(function ColorsSection() {
  const { values, updateColorValue } = useDesign();
  const {
    primaryColor,
    secondaryColor,
    backgroundColor,
    textColor,
    mutedTextColor,
    sidebarBackground,
    sidebarText,
    layoutType,
  } = values;

  const isTwoColumn =
    layoutType === "two-column-sidebar" || layoutType === "two-column";

  return (
    <Accordion
      title="Colors"
      icon={<Palette className="h-3.5 w-3.5" />}
      defaultOpen
    >
      <div className="space-y-4">
        {/* Color Presets */}
        <div>
          <span className="mb-2 block text-xs font-medium text-slate-600">
            Presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateColorValue("primary", preset.primary)}
                className={clsx(
                  "h-6 w-6 rounded-full transition-all duration-150 hover:scale-110",
                  primaryColor === preset.primary
                    ? "ring-2 ring-slate-800 ring-offset-2"
                    : "ring-1 ring-slate-200 ring-inset hover:ring-slate-300"
                )}
                style={{ backgroundColor: preset.primary }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Individual Color Pickers */}
        <ColorPickerRow
          label="Primary"
          value={primaryColor}
          onChange={(c) => updateColorValue("primary", c)}
        />
        <ColorPickerRow
          label="Secondary"
          value={secondaryColor}
          onChange={(c) => updateColorValue("secondary", c)}
        />
        <ColorPickerRow
          label="Background"
          value={backgroundColor}
          onChange={(c) => updateColorValue("background", c)}
        />
        <ColorPickerRow
          label="Text"
          value={textColor}
          onChange={(c) => updateColorValue("text", c)}
        />
        <ColorPickerRow
          label="Muted"
          value={mutedTextColor}
          onChange={(c) => updateColorValue("mutedText", c)}
        />

        {/* Two-Column Sidebar Colors */}
        {isTwoColumn && (
          <div className="mt-2 space-y-3 border-t border-slate-200 pt-4">
            <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Sidebar Colors
            </span>
            <ColorPickerRow
              label="Sidebar Background"
              value={sidebarBackground}
              onChange={(c) => updateColorValue("sidebarBackground", c)}
            />
            <ColorPickerRow
              label="Sidebar Text"
              value={sidebarText}
              onChange={(c) => updateColorValue("sidebarText", c)}
            />
          </div>
        )}
      </div>
    </Accordion>
  );
});

const TypographySection = memo(function TypographySection() {
  const { values, updateFont, updateTypographySize, updateLineHeight } =
    useDesign();
  const {
    font,
    nameSize,
    titleSize,
    sectionHeadingSize,
    bodySize,
    lineHeight,
  } = values;

  return (
    <Accordion title="Typography" icon={<Type className="h-3.5 w-3.5" />}>
      <div className="space-y-3">
        <FontSelector value={font} onChange={updateFont} />
        <Slider
          label="Name"
          value={nameSize}
          min={20}
          max={36}
          onChange={(v) => updateTypographySize("name", v)}
        />
        <Slider
          label="Title"
          value={titleSize}
          min={10}
          max={24}
          onChange={(v) => updateTypographySize("title", v)}
        />
        <Slider
          label="Heading"
          value={sectionHeadingSize}
          min={10}
          max={20}
          onChange={(v) => updateTypographySize("sectionHeading", v)}
        />
        <Slider
          label="Body"
          value={bodySize}
          min={8}
          max={14}
          onChange={(v) => updateTypographySize("body", v)}
        />
        <Slider
          label="Line Height"
          value={lineHeight}
          min={1}
          max={2}
          step={0.1}
          onChange={updateLineHeight}
        />
      </div>
    </Accordion>
  );
});

const LayoutSection = memo(function LayoutSection() {
  const { values, updateLayoutType, updateLayoutValue, updatePadding } =
    useDesign();
  const { layoutType, sectionGap, itemGap, pagePadding } = values;

  return (
    <Accordion title="Layout" icon={<Columns className="h-3.5 w-3.5" />}>
      <div className="space-y-3">
        <ToggleGroup
          label="Type"
          options={["single-column", "two-column-sidebar"] as const}
          value={layoutType as "single-column" | "two-column-sidebar"}
          onChange={updateLayoutType}
          columns={2}
        />
        <Slider
          label="Section Gap"
          value={sectionGap}
          min={8}
          max={48}
          onChange={(v) => updateLayoutValue("sectionGap", v)}
        />
        <Slider
          label="Item Gap"
          value={itemGap}
          min={4}
          max={24}
          onChange={(v) => updateLayoutValue("itemGap", v)}
        />
        <Slider
          label="Page Padding"
          value={pagePadding}
          min={20}
          max={60}
          onChange={updatePadding}
        />
      </div>
    </Accordion>
  );
});

const SectionsSection = memo(function SectionsSection() {
  const { values, updateSections } = useDesign();
  const { headingStyle, showItemDividers, itemHeaderLayout } = values;

  return (
    <Accordion title="Sections" icon={<Heading className="h-3.5 w-3.5" />}>
      <div className="space-y-3">
        <ToggleGroup
          label="Heading Style"
          options={["simple", "underlined", "boxed", "accent-left"] as const}
          value={headingStyle}
          onChange={(v) => updateSections({ headingStyle: v })}
          columns={4}
        />
        <ToggleGroup
          label="Item Layout"
          options={["inline", "stacked"] as const}
          value={itemHeaderLayout}
          onChange={(v) => updateSections({ itemHeaderLayout: v })}
        />
        <CheckboxRow
          label="Item Dividers"
          checked={showItemDividers}
          onChange={(checked) => updateSections({ showItemDividers: checked })}
        />
      </div>
    </Accordion>
  );
});

const SkillsSection = memo(function SkillsSection() {
  const { values, updateSkills } = useDesign();
  const { skillsDisplay, skillsTagShape } = values;

  return (
    <Accordion title="Skills" icon={<Tag className="h-3.5 w-3.5" />}>
      <div className="space-y-3">
        <ToggleGroup
          label="Display"
          options={["tags", "inline", "list", "grid"] as const}
          value={skillsDisplay}
          onChange={(v) => updateSkills({ display: v })}
        />
        {skillsDisplay === "tags" && (
          <ToggleGroup
            label="Shape"
            options={["rounded", "pill", "square"] as const}
            value={skillsTagShape}
            onChange={(v) => updateSkills({ tagShape: v })}
          />
        )}
      </div>
    </Accordion>
  );
});

const LanguagesSection = memo(function LanguagesSection() {
  const { values, updateLanguages } = useDesign();
  const { languagesDisplay, showLanguageLevel, languageLevelStyle } = values;

  return (
    <Accordion title="Languages" icon={<Languages className="h-3.5 w-3.5" />}>
      <div className="space-y-3">
        <ToggleGroup
          label="Display"
          options={["inline", "list", "grid"] as const}
          value={languagesDisplay}
          onChange={(v) => updateLanguages({ display: v })}
        />
        <CheckboxRow
          label="Show Level"
          checked={showLanguageLevel}
          onChange={(checked) => updateLanguages({ showLevel: checked })}
        />
        {showLanguageLevel && (
          <ToggleGroup
            label="Level Style"
            options={["text", "dots", "bar"] as const}
            value={languageLevelStyle}
            onChange={(v) => updateLanguages({ levelStyle: v })}
          />
        )}
      </div>
    </Accordion>
  );
});

// ============================================
// Main DesignPanel Component
// ============================================

export const DesignPanel = memo(function DesignPanel() {
  return (
    <aside className="relative flex w-80 shrink-0 flex-col border-l border-slate-200/60 bg-linear-to-b from-slate-50 via-white to-slate-50/80">
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/25">
            <SlidersHorizontal className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Design System</h2>
            <p className="text-[10px] text-slate-500">
              Customize your resume appearance
            </p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-2.5 pb-6">
          <TemplateSection />
          <HeaderSection />
          <PhotoSection />
          <ColorsSection />
          <TypographySection />
          <LayoutSection />
          <SectionsSection />
          <SkillsSection />
          <LanguagesSection />
        </div>
      </ScrollArea>
    </aside>
  );
});

export default DesignPanel;

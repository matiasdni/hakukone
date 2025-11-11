"use client";

import { useSaveDesignOverrides } from "@/hooks/useTRPC";
import { resolveTemplate } from "@/lib/templates";
import type {
  FontFamily,
  HeaderConfig,
  LanguagesStyle,
  PhotoOptions,
  ResolvedTemplate,
  SectionStyle,
  SkillsStyle,
  TemplateOverrides,
} from "@/lib/templates/types";
import {
  useDesignStore,
  useResumeHistoryState,
  useResumeOverrides,
  useResumeTemplateId,
} from "@/stores/designStore";
import { useUser } from "@stackframe/stack";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

// ============================================
// Context Type Definitions
// ============================================

interface DesignValues {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  sidebarBackground: string;
  sidebarText: string;
  font: FontFamily;
  layoutType: "single-column" | "two-column" | "two-column-sidebar";
  lineHeight: number;
  sectionGap: number;
  itemGap: number;
  pagePadding: number;
  nameSize: number;
  titleSize: number;
  sectionHeadingSize: number;
  bodySize: number;
  headingStyle: "simple" | "underlined" | "boxed" | "accent-left";
  showItemDividers: boolean;
  itemHeaderLayout: "inline" | "stacked";
  skillsDisplay: "tags" | "inline" | "list" | "grid";
  skillsTagShape: "rounded" | "pill" | "square";
  languagesDisplay: "inline" | "list" | "grid";
  showLanguageLevel: boolean;
  languageLevelStyle: "text" | "dots" | "bar";
  headerLayout: "left" | "center" | "split";
  headerShowDivider: boolean;
  headerContactLayout: "inline" | "stacked" | "grid";
  headerShowContactIcons: boolean;
  photoShow: boolean;
  photoSize: number;
  photoShape: "circle" | "rounded" | "square";
  photoPosition: "left" | "right" | "center";
}

interface DesignContextValue {
  resumeId: string;
  templateId: string;
  overrides: TemplateOverrides;
  values: DesignValues;

  // Update functions
  setTemplateId: (templateId: string) => void;
  setOverrides: (overrides: TemplateOverrides) => void;
  updateColors: (colors: Partial<TemplateOverrides["colors"]>) => void;
  updateTypography: (
    typography: Partial<TemplateOverrides["typography"]>
  ) => void;
  updateLayout: (layout: Partial<TemplateOverrides["layout"]>) => void;
  updateSections: (sections: Partial<SectionStyle>) => void;
  updateSkills: (skills: Partial<SkillsStyle>) => void;
  updateLanguages: (languages: Partial<LanguagesStyle>) => void;
  updateHeader: (header: Partial<HeaderConfig>) => void;
  updatePhoto: (photo: Partial<PhotoOptions>) => void;
  updateColorValue: (key: string, value: string) => void;
  updateFont: (baseFontFamily: FontFamily) => void;
  updateLayoutType: (type: "single-column" | "two-column-sidebar") => void;
  updateLayoutValue: (key: "sectionGap" | "itemGap", value: number) => void;
  updatePadding: (value: number) => void;
  updateTypographySize: (
    key: "name" | "title" | "sectionHeading" | "body",
    fontSize: number
  ) => void;
  updateLineHeight: (lineHeight: number) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// ============================================
// Context
// ============================================

const DesignContext = createContext<DesignContextValue | null>(null);

// ============================================
// Helper to compute values from resolved template
// ============================================

/**
 * Compute design values from a resolved template.
 * Uses the template's defaults merged with user overrides.
 */
function computeValues(template: ResolvedTemplate): DesignValues {
  return {
    // Colors - from resolved template
    primaryColor: template.colors.primary,
    secondaryColor: template.colors.secondary || template.colors.primary,
    backgroundColor: template.colors.background,
    textColor: template.colors.text,
    mutedTextColor: template.colors.mutedText,
    sidebarBackground:
      template.colors.sidebarBackground || template.colors.background,
    sidebarText: template.colors.sidebarText || template.colors.text,

    // Typography
    font: template.typography.baseFontFamily,
    lineHeight: template.typography.body.lineHeight ?? 1.5,
    nameSize: template.typography.name.fontSize,
    titleSize: template.typography.title.fontSize,
    sectionHeadingSize: template.typography.sectionHeading.fontSize,
    bodySize: template.typography.body.fontSize,

    // Layout
    layoutType: template.layout.type as DesignValues["layoutType"],
    sectionGap: template.layout.sectionGap,
    itemGap: template.layout.itemGap,
    pagePadding: template.layout.pagePadding.top,

    // Sections
    headingStyle: template.sections.headingStyle,
    showItemDividers: template.sections.showItemDividers,
    itemHeaderLayout: template.sections.itemHeaderLayout,

    // Skills
    skillsDisplay: template.skills.display,
    skillsTagShape: template.skills.tagShape ?? "rounded",

    // Languages
    languagesDisplay: template.languages.display,
    showLanguageLevel: template.languages.showLevel,
    languageLevelStyle: template.languages.levelStyle ?? "text",

    // Header
    headerLayout: template.header.layout,
    headerShowDivider: template.header.showDivider,
    headerContactLayout: template.header.contactLayout,
    headerShowContactIcons: template.header.showContactIcons,

    // Photo
    photoShow: template.photo.show,
    photoSize: template.photo.size,
    photoShape: template.photo.shape,
    photoPosition: template.photo.position ?? "right",
  };
}

// ============================================
// Provider Component
// ============================================

interface DesignProviderProps {
  resumeId: string;
  children: React.ReactNode;
}

export function DesignProvider({ resumeId, children }: DesignProviderProps) {
  const user = useUser();
  // Use the pre-defined reactive selectors - these properly subscribe to store changes
  const overrides = useResumeOverrides(resumeId);
  const templateId = useResumeTemplateId(resumeId);
  const { canUndo, canRedo } = useResumeHistoryState(resumeId);

  // Get store actions ONCE using getState() - these are stable
  const storeRef = useRef(useDesignStore.getState());

  // Resolve template with overrides to get merged values
  // This uses deepMerge internally and properly falls back to template defaults
  const resolvedTemplate = useMemo(
    () => resolveTemplate(templateId, overrides),
    [templateId, overrides]
  );

  // Compute UI values from the resolved template
  const values = useMemo(
    () => computeValues(resolvedTemplate),
    [resolvedTemplate]
  );

  // Create stable callbacks using refs to avoid dependency issues
  const resumeIdRef = useRef(resumeId);
  resumeIdRef.current = resumeId;

  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;

  // All update functions use refs so they never change
  const setTemplateId = useCallback((id: string) => {
    storeRef.current.setTemplateId(resumeIdRef.current, id);
  }, []);

  const setOverrides = useCallback((newOverrides: TemplateOverrides) => {
    storeRef.current.setOverrides(resumeIdRef.current, newOverrides);
  }, []);

  const updateColors = useCallback(
    (colors: Partial<TemplateOverrides["colors"]>) => {
      storeRef.current.updateColors(resumeIdRef.current, colors);
    },
    []
  );

  const updateTypography = useCallback(
    (typography: Partial<TemplateOverrides["typography"]>) => {
      storeRef.current.updateTypography(resumeIdRef.current, typography);
    },
    []
  );

  const updateLayout = useCallback(
    (layout: Partial<TemplateOverrides["layout"]>) => {
      storeRef.current.updateLayout(resumeIdRef.current, layout);
    },
    []
  );

  const updateSections = useCallback((sections: Partial<SectionStyle>) => {
    storeRef.current.updateSections(resumeIdRef.current, sections);
  }, []);

  const updateSkills = useCallback((skills: Partial<SkillsStyle>) => {
    storeRef.current.updateSkills(resumeIdRef.current, skills);
  }, []);

  const updateLanguages = useCallback((languages: Partial<LanguagesStyle>) => {
    storeRef.current.updateLanguages(resumeIdRef.current, languages);
  }, []);

  const updateHeader = useCallback((header: Partial<HeaderConfig>) => {
    storeRef.current.updateHeader(resumeIdRef.current, header);
  }, []);

  const updatePhoto = useCallback((photo: Partial<PhotoOptions>) => {
    storeRef.current.updatePhoto(resumeIdRef.current, photo);
  }, []);

  const updateColorValue = useCallback((key: string, value: string) => {
    storeRef.current.updateColors(resumeIdRef.current, { [key]: value });
  }, []);

  const updateFont = useCallback((baseFontFamily: FontFamily) => {
    storeRef.current.updateTypography(resumeIdRef.current, { baseFontFamily });
  }, []);

  const updateLayoutType = useCallback(
    (type: "single-column" | "two-column-sidebar") => {
      storeRef.current.updateLayout(resumeIdRef.current, { type });
    },
    []
  );

  const updateLayoutValue = useCallback(
    (key: "sectionGap" | "itemGap", value: number) => {
      storeRef.current.updateLayout(resumeIdRef.current, { [key]: value });
    },
    []
  );

  const updatePadding = useCallback((value: number) => {
    storeRef.current.updateLayout(resumeIdRef.current, {
      pagePadding: { top: value, right: value, bottom: value, left: value },
    });
  }, []);

  const updateTypographySize = useCallback(
    (key: "name" | "title" | "sectionHeading" | "body", fontSize: number) => {
      const current = overridesRef.current.typography?.[key] || {};
      storeRef.current.updateTypography(resumeIdRef.current, {
        [key]: { ...current, fontSize },
      });
    },
    []
  );

  // ...existing code...

  const updateLineHeight = useCallback((lineHeight: number) => {
    const existingBody = overridesRef.current.typography?.body || {
      fontSize: 11,
    };
    storeRef.current.updateTypography(resumeIdRef.current, {
      body: { ...existingBody, lineHeight },
    });
  }, []);

  const undo = useCallback(() => {
    storeRef.current.undo(resumeIdRef.current);
  }, []);

  const redo = useCallback(() => {
    storeRef.current.redo(resumeIdRef.current);
  }, []);

  const saveOverrides = useSaveDesignOverrides();
  // Use ref to access mutation without causing effect re-runs
  const saveOverridesRef = useRef(saveOverrides);
  saveOverridesRef.current = saveOverrides;

  // Track if we're in initial hydration to prevent auto-save
  const isInitialMount = useRef(true);
  const lastSavedRef = useRef<string | null>(null);

  // Persist overrides to the server when they change (debounced)
  // Only save if it's a user-initiated change, not initial hydration
  useEffect(() => {
    if (!user || !resumeId) return;

    // Skip save on initial mount - data comes from server
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastSavedRef.current = JSON.stringify({ templateId, overrides });
      return;
    }

    const currentData = JSON.stringify({ templateId, overrides });

    // Skip if nothing changed since last save
    if (currentData === lastSavedRef.current) return;

    const timeout = setTimeout(() => {
      saveOverridesRef.current.mutate({
        resumeId,
        templateId,
        overrides,
      });
      lastSavedRef.current = currentData;
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [user, resumeId, templateId, overrides]); // Removed saveOverrides from deps

  // Context value - only changes when data changes, not when callbacks change
  const contextValue = useMemo<DesignContextValue>(
    () => ({
      resumeId,
      templateId,
      overrides,
      values,
      setTemplateId,
      setOverrides,
      updateColors,
      updateTypography,
      updateLayout,
      updateSections,
      updateSkills,
      updateLanguages,
      updateHeader,
      updatePhoto,
      updateColorValue,
      updateFont,
      updateLayoutType,
      updateLayoutValue,
      updatePadding,
      updateTypographySize,
      updateLineHeight,
      undo,
      redo,
      canUndo,
      canRedo,
    }),
    [
      resumeId,
      templateId,
      overrides,
      values,
      canUndo,
      canRedo,
      setTemplateId,
      setOverrides,
      updateColors,
      updateTypography,
      updateLayout,
      updateSections,
      updateSkills,
      updateLanguages,
      updateHeader,
      updatePhoto,
      updateColorValue,
      updateFont,
      updateLayoutType,
      updateLayoutValue,
      updatePadding,
      updateTypographySize,
      updateLineHeight,
      undo,
      redo,
    ]
  ); // Only data dependencies, not callbacks

  return (
    <DesignContext.Provider value={contextValue}>
      {children}
    </DesignContext.Provider>
  );
}

// ============================================
// Consumer Hooks
// ============================================

export function useDesign() {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error("useDesign must be used within a DesignProvider");
  }
  return context;
}

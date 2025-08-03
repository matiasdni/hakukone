"use client";

import type {
    FontFamily,
    HeaderConfig,
    LanguagesStyle,
    PhotoOptions,
    SectionStyle,
    SkillsStyle,
    TemplateOverrides,
} from "@/lib/templates/types";
import {
    useDesignStore,
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
}

// ============================================
// Context
// ============================================

const DesignContext = createContext<DesignContextValue | null>(null);

// ============================================
// Helper to compute values from overrides
// ============================================

function computeValues(overrides: TemplateOverrides): DesignValues {
  return {
    primaryColor: overrides.colors?.primary || "#2563eb",
    secondaryColor: overrides.colors?.secondary || "#64748b",
    backgroundColor: overrides.colors?.background || "#ffffff",
    textColor: overrides.colors?.text || "#1e293b",
    mutedTextColor: overrides.colors?.mutedText || "#64748b",
    sidebarBackground: overrides.colors?.sidebarBackground || "#0f172a",
    sidebarText: overrides.colors?.sidebarText || "#ffffff",
    font: (overrides.typography?.baseFontFamily || "inter") as FontFamily,
    layoutType: (overrides.layout?.type ||
      "single-column") as DesignValues["layoutType"],
    lineHeight: overrides.typography?.body?.lineHeight ?? 1.5,
    sectionGap: overrides.layout?.sectionGap ?? 24,
    itemGap: overrides.layout?.itemGap ?? 12,
    pagePadding: overrides.layout?.pagePadding?.top ?? 40,
    nameSize: overrides.typography?.name?.fontSize ?? 28,
    titleSize: overrides.typography?.title?.fontSize ?? 16,
    sectionHeadingSize: overrides.typography?.sectionHeading?.fontSize ?? 14,
    bodySize: overrides.typography?.body?.fontSize ?? 11,
    headingStyle: (overrides.sections?.headingStyle ??
      "underlined") as DesignValues["headingStyle"],
    showItemDividers: overrides.sections?.showItemDividers ?? false,
    itemHeaderLayout: overrides.sections?.itemHeaderLayout ?? "inline",
    skillsDisplay: (overrides.skills?.display ??
      "tags") as DesignValues["skillsDisplay"],
    skillsTagShape: overrides.skills?.tagShape ?? "rounded",
    languagesDisplay: (overrides.languages?.display ??
      "list") as DesignValues["languagesDisplay"],
    showLanguageLevel: overrides.languages?.showLevel ?? true,
    languageLevelStyle: (overrides.languages?.levelStyle ??
      "text") as DesignValues["languageLevelStyle"],
    headerLayout: overrides.header?.layout ?? "left",
    headerShowDivider: overrides.header?.showDivider ?? true,
    headerContactLayout: overrides.header?.contactLayout ?? "inline",
    headerShowContactIcons: overrides.header?.showContactIcons ?? false,
    photoShow: overrides.photo?.show ?? false,
    photoSize: overrides.photo?.size ?? 80,
    photoShape: overrides.photo?.shape ?? "circle",
    photoPosition: (overrides.photo?.position ??
      "right") as DesignValues["photoPosition"],
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

  // Get store actions ONCE using getState() - these are stable
  const storeRef = useRef(useDesignStore.getState());

  // Compute values - memoize based on overrides reference
  const values = useMemo(() => computeValues(overrides), [overrides]);

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

  const updateLineHeight = useCallback((lineHeight: number) => {
    const existingBody = overridesRef.current.typography?.body || {
      fontSize: 11,
    };
    storeRef.current.updateTypography(resumeIdRef.current, {
      body: { ...existingBody, lineHeight },
    });
  }, []);

  // Persist overrides to the server when they change (debounced)
  useEffect(() => {
    if (!user || !resumeId) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch("/api/design-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          templateId,
          overrides,
        }),
        signal: controller.signal,
      }).catch((err) => {
        // Ignore AbortError - this is expected when component unmounts
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Failed to save design overrides", err);
      });
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [user, resumeId, templateId, overrides]);

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
    }),
    [resumeId, templateId, overrides, values]
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

"use client";

import type {
  HeaderConfig,
  LanguagesStyle,
  LayoutConfig,
  PhotoOptions,
  SectionStyle,
  SkillsStyle,
  TemplateOverrides,
  TypographyConfig,
} from "@/lib/templates/types";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useShallow } from "zustand/shallow";

// ============================================
// Deep Merge Utility for Nested Objects
// ============================================

/**
 * Deep merge two objects, with source values overriding target values.
 * Handles nested objects properly without overwriting entire sub-objects.
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== undefined &&
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      // Recursively merge nested objects
      (result as Record<string, unknown>)[key] = deepMerge(
        targetValue as object,
        sourceValue as object
      );
    } else if (sourceValue !== undefined) {
      // Direct assignment for primitives and arrays
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Helper to update history state
 */
const pushToHistory = (
  historyMap: Map<
    string,
    { past: TemplateOverrides[]; future: TemplateOverrides[] }
  >,
  resumeId: string,
  currentOverrides: TemplateOverrides
) => {
  const history = historyMap.get(resumeId) || { past: [], future: [] };
  // Limit history to 50 steps
  const newPast = [...history.past, currentOverrides].slice(-50);

  const newHistoryMap = new Map(historyMap);
  newHistoryMap.set(resumeId, { past: newPast, future: [] });
  return newHistoryMap;
};

// ============================================
// Design Store - Dedicated store for template design
// ============================================

interface DesignState {
  // Map-based storage for O(1) lookup
  overridesMap: Map<string, TemplateOverrides>;
  templateMap: Map<string, string>; // resumeId -> templateId

  // History for undo/redo
  historyMap: Map<
    string,
    { past: TemplateOverrides[]; future: TemplateOverrides[] }
  >;

  // Current active resume context
  activeResumeId: string | null;

  // Actions
  setActiveResume: (resumeId: string | null) => void;
  getOverrides: (resumeId: string) => TemplateOverrides;
  getTemplateId: (resumeId: string) => string;

  // History Actions
  undo: (resumeId: string) => void;
  redo: (resumeId: string) => void;
  canUndo: (resumeId: string) => boolean;
  canRedo: (resumeId: string) => boolean;

  // Granular update actions - prevent full re-renders
  setOverrides: (resumeId: string, overrides: TemplateOverrides) => void;
  setTemplateId: (resumeId: string, templateId: string) => void;

  // Atomic update actions for specific override slices
  updateColors: (
    resumeId: string,
    colors: Partial<TemplateOverrides["colors"]>
  ) => void;
  updateTypography: (
    resumeId: string,
    typography: Partial<TemplateOverrides["typography"]>
  ) => void;
  updateLayout: (
    resumeId: string,
    layout: Partial<TemplateOverrides["layout"]>
  ) => void;
  updateSections: (resumeId: string, sections: Partial<SectionStyle>) => void;
  updateSkills: (resumeId: string, skills: Partial<SkillsStyle>) => void;
  updateLanguages: (
    resumeId: string,
    languages: Partial<LanguagesStyle>
  ) => void;
  updateHeader: (resumeId: string, header: Partial<HeaderConfig>) => void;
  updatePhoto: (resumeId: string, photo: Partial<PhotoOptions>) => void;

  // Bulk initialization from persisted data
  hydrate: (
    data: Array<{
      resumeId: string;
      templateId: string;
      overrides?: TemplateOverrides;
    }>
  ) => void;

  // Export for persistence
  serialize: () => Array<{
    resumeId: string;
    templateId: string;
    overrides?: TemplateOverrides;
  }>;
}

const DEFAULT_TEMPLATE_ID = "modern";

export const useDesignStore = create<DesignState>()(
  subscribeWithSelector((set, get) => ({
    overridesMap: new Map(),
    templateMap: new Map(),
    historyMap: new Map(),
    activeResumeId: null,

    setActiveResume: (resumeId) => set({ activeResumeId: resumeId }),

    getOverrides: (resumeId) => {
      return get().overridesMap.get(resumeId) || {};
    },

    getTemplateId: (resumeId) => {
      return get().templateMap.get(resumeId) || DEFAULT_TEMPLATE_ID;
    },

    canUndo: (resumeId) => {
      const history = get().historyMap.get(resumeId);
      return !!history && history.past.length > 0;
    },

    canRedo: (resumeId) => {
      const history = get().historyMap.get(resumeId);
      return !!history && history.future.length > 0;
    },

    undo: (resumeId) => {
      set((state) => {
        const history = state.historyMap.get(resumeId);
        if (!history || history.past.length === 0) return {};

        const previous = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, -1);

        const currentOverrides = state.overridesMap.get(resumeId) || {};
        const newFuture = [currentOverrides, ...history.future];

        const newHistoryMap = new Map(state.historyMap);
        newHistoryMap.set(resumeId, { past: newPast, future: newFuture });

        const newOverridesMap = new Map(state.overridesMap);
        newOverridesMap.set(resumeId, previous);

        return { overridesMap: newOverridesMap, historyMap: newHistoryMap };
      });
    },

    redo: (resumeId) => {
      set((state) => {
        const history = state.historyMap.get(resumeId);
        if (!history || history.future.length === 0) return {};

        const next = history.future[0];
        const newFuture = history.future.slice(1);

        const currentOverrides = state.overridesMap.get(resumeId) || {};
        const newPast = [...history.past, currentOverrides];

        const newHistoryMap = new Map(state.historyMap);
        newHistoryMap.set(resumeId, { past: newPast, future: newFuture });

        const newOverridesMap = new Map(state.overridesMap);
        newOverridesMap.set(resumeId, next);

        return { overridesMap: newOverridesMap, historyMap: newHistoryMap };
      });
    },

    setOverrides: (resumeId, overrides) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newHistoryMap = pushToHistory(
          state.historyMap,
          resumeId,
          current
        );

        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, overrides);
        return { overridesMap: newMap, historyMap: newHistoryMap };
      });
    },

    setTemplateId: (resumeId, templateId) => {
      set((state) => {
        const newMap = new Map(state.templateMap);
        newMap.set(resumeId, templateId);
        return { templateMap: newMap };
      });
    },

    updateColors: (resumeId, colors) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newHistoryMap = pushToHistory(
          state.historyMap,
          resumeId,
          current
        );

        const currentColors = current.colors || {};
        const newOverrides: TemplateOverrides = {
          ...current,
          colors: deepMerge(
            currentColors as object,
            colors as object
          ) as Partial<TemplateOverrides["colors"]>,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap, historyMap: newHistoryMap };
      });
    },

    updateTypography: (resumeId, typography) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newHistoryMap = pushToHistory(
          state.historyMap,
          resumeId,
          current
        );

        const currentTypography = current.typography || {};
        const newOverrides: TemplateOverrides = {
          ...current,
          typography: deepMerge(
            currentTypography as object,
            typography as object
          ) as Partial<TypographyConfig>,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap, historyMap: newHistoryMap };
      });
    },

    updateLayout: (resumeId, layout) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newHistoryMap = pushToHistory(
          state.historyMap,
          resumeId,
          current
        );

        const currentLayout = current.layout || {};
        const newOverrides: TemplateOverrides = {
          ...current,
          layout: deepMerge(
            currentLayout as object,
            layout as object
          ) as Partial<LayoutConfig>,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap, historyMap: newHistoryMap };
      });
    },

    updateSections: (resumeId, sections) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newHistoryMap = pushToHistory(
          state.historyMap,
          resumeId,
          current
        );

        const currentSections = current.sections || {};
        const newOverrides: TemplateOverrides = {
          ...current,
          sections: deepMerge(
            currentSections as object,
            sections as object
          ) as Partial<SectionStyle>,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap, historyMap: newHistoryMap };
      });
    },

    updateSkills: (resumeId, skills) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newHistoryMap = pushToHistory(
          state.historyMap,
          resumeId,
          current
        );

        const currentSkills = current.skills || {};
        const newOverrides: TemplateOverrides = {
          ...current,
          skills: deepMerge(
            currentSkills as object,
            skills as object
          ) as Partial<SkillsStyle>,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap, historyMap: newHistoryMap };
      });
    },

    updateLanguages: (resumeId, languages) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newHistoryMap = pushToHistory(
          state.historyMap,
          resumeId,
          current
        );

        const currentLanguages = current.languages || {};
        const newOverrides: TemplateOverrides = {
          ...current,
          languages: deepMerge(
            currentLanguages as object,
            languages as object
          ) as Partial<LanguagesStyle>,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap, historyMap: newHistoryMap };
      });
    },

    updateHeader: (resumeId, header) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newHistoryMap = pushToHistory(
          state.historyMap,
          resumeId,
          current
        );

        const currentHeader = current.header || {};
        const newOverrides: TemplateOverrides = {
          ...current,
          header: deepMerge(
            currentHeader as object,
            header as object
          ) as Partial<HeaderConfig>,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap, historyMap: newHistoryMap };
      });
    },

    updatePhoto: (resumeId, photo) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newHistoryMap = pushToHistory(
          state.historyMap,
          resumeId,
          current
        );

        const currentPhoto = current.photo || {};
        const newOverrides: TemplateOverrides = {
          ...current,
          photo: deepMerge(
            currentPhoto as object,
            photo as object
          ) as Partial<PhotoOptions>,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap, historyMap: newHistoryMap };
      });
    },

    hydrate: (data) => {
      const overridesMap = new Map<string, TemplateOverrides>();
      const templateMap = new Map<string, string>();

      data.forEach(({ resumeId, templateId, overrides }) => {
        templateMap.set(resumeId, templateId);
        if (overrides) {
          overridesMap.set(resumeId, overrides);
        }
      });

      set({ overridesMap, templateMap });
    },

    serialize: () => {
      const state = get();
      const result: Array<{
        resumeId: string;
        templateId: string;
        overrides?: TemplateOverrides;
      }> = [];

      // Combine both maps
      const allResumeIds = new Set([
        ...state.overridesMap.keys(),
        ...state.templateMap.keys(),
      ]);

      allResumeIds.forEach((resumeId) => {
        result.push({
          resumeId,
          templateId: state.templateMap.get(resumeId) || DEFAULT_TEMPLATE_ID,
          overrides: state.overridesMap.get(resumeId),
        });
      });

      return result;
    },
  }))
);

// ============================================
// Optimized Selectors with Shallow Equality
// ============================================

// Stable empty object for when there are no overrides
const EMPTY_OVERRIDES: TemplateOverrides = {};

/**
 * Get overrides for a specific resume with shallow equality check
 */
export const useResumeOverrides = (resumeId: string | null) => {
  return useDesignStore((state) => {
    if (!resumeId) return EMPTY_OVERRIDES;
    return state.overridesMap.get(resumeId) || EMPTY_OVERRIDES;
  });
};

/**
 * Get template ID for a specific resume
 */
export const useResumeTemplateId = (resumeId: string | null) => {
  return useDesignStore((state) => {
    if (!resumeId) return DEFAULT_TEMPLATE_ID;
    return state.templateMap.get(resumeId) || DEFAULT_TEMPLATE_ID;
  });
};

// Stable empty state for when there is no history
const EMPTY_HISTORY_STATE = { canUndo: false, canRedo: false };

/**
 * Get history state (canUndo/canRedo) for a specific resume.
 * Uses useShallow to prevent infinite re-renders from object reference changes.
 */
export const useResumeHistoryState = (resumeId: string | null) => {
  return useDesignStore(
    useShallow((state) => {
      if (!resumeId) return EMPTY_HISTORY_STATE;
      const history = state.historyMap.get(resumeId);
      return {
        canUndo: !!(history?.past && history.past.length > 0),
        canRedo: !!(history?.future && history.future.length > 0),
      };
    })
  );
};

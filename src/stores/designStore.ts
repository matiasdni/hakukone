"use client";

import type {
    HeaderConfig,
    LanguagesStyle,
    PhotoOptions,
    SectionStyle,
    SkillsStyle,
    TemplateOverrides,
} from "@/lib/templates/types";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// ============================================
// Design Store - Dedicated store for template design
// ============================================

interface DesignState {
  // Map-based storage for O(1) lookup
  overridesMap: Map<string, TemplateOverrides>;
  templateMap: Map<string, string>; // resumeId -> templateId

  // Current active resume context
  activeResumeId: string | null;

  // Actions
  setActiveResume: (resumeId: string | null) => void;
  getOverrides: (resumeId: string) => TemplateOverrides;
  getTemplateId: (resumeId: string) => string;

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
    activeResumeId: null,

    setActiveResume: (resumeId) => set({ activeResumeId: resumeId }),

    getOverrides: (resumeId) => {
      return get().overridesMap.get(resumeId) || {};
    },

    getTemplateId: (resumeId) => {
      return get().templateMap.get(resumeId) || DEFAULT_TEMPLATE_ID;
    },

    setOverrides: (resumeId, overrides) => {
      set((state) => {
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, overrides);
        return { overridesMap: newMap };
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
        const newOverrides = {
          ...current,
          colors: { ...current.colors, ...colors },
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap };
      });
    },

    updateTypography: (resumeId, typography) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newOverrides = {
          ...current,
          typography: { ...current.typography, ...typography },
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap };
      });
    },

    updateLayout: (resumeId, layout) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newOverrides = {
          ...current,
          layout: { ...current.layout, ...layout },
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap };
      });
    },

    updateSections: (resumeId, sections) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newOverrides = {
          ...current,
          sections: { ...current.sections, ...sections } as SectionStyle,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap };
      });
    },

    updateSkills: (resumeId, skills) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newOverrides = {
          ...current,
          skills: { ...current.skills, ...skills } as SkillsStyle,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap };
      });
    },

    updateLanguages: (resumeId, languages) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newOverrides = {
          ...current,
          languages: { ...current.languages, ...languages } as LanguagesStyle,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap };
      });
    },

    updateHeader: (resumeId, header) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newOverrides = {
          ...current,
          header: { ...current.header, ...header } as HeaderConfig,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap };
      });
    },

    updatePhoto: (resumeId, photo) => {
      set((state) => {
        const current = state.overridesMap.get(resumeId) || {};
        const newOverrides = {
          ...current,
          photo: { ...current.photo, ...photo } as PhotoOptions,
        };
        const newMap = new Map(state.overridesMap);
        newMap.set(resumeId, newOverrides);
        return { overridesMap: newMap };
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

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Supported locales
  locales: ["en", "fi"],

  // Default locale used when no locale matches
  defaultLocale: "en",

  // Use prefix for all locales except default
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

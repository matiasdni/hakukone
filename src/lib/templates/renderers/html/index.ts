/**
 * HTML Template Renderer
 *
 * Exports the main TemplateRenderer component and section components
 * for rendering resumes with template configurations
 */

export { TemplateRenderer, default } from "./TemplateRenderer";
export { HeaderSection } from "./sections/HeaderSection";
export {
  SummarySection,
  SectionHeading,
  getSectionHeadingStyle,
} from "./sections/SummarySection";
export { ExperienceSection } from "./sections/ExperienceSection";
export { EducationSection } from "./sections/EducationSection";
export { SkillsSection } from "./sections/SkillsSection";
export { LanguagesSection } from "./sections/LanguagesSection";

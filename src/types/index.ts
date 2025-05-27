export interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Language {
  id: string;
  name: string;
  level: "Native" | "Fluent" | "Proficient" | "Intermediate" | "Basic";
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomItem[];
}

export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "custom";

export interface SectionConfig {
  id: string;
  type: SectionType;
  name?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  fontFamily: "sans" | "serif" | "mono";
}

export interface SocialLink {
  platform: "linkedin" | "github" | "portfolio" | "twitter" | "other";
  url: string;
}

export interface ResumeData {
  id: string;
  lastModified: number;

  // Header Info
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location?: string;
  photoUrl?: string;
  socialLinks?: SocialLink[];

  // Content
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications?: Certification[];
  languages?: Language[];
  customSections: CustomSection[];

  // Config
  sectionOrder: SectionConfig[];
  templateId?: string;
  theme?: ThemeConfig;
  linkedJobId?: string;
}

export interface CoverLetter {
  id: string;
  title: string;
  company: string;
  jobTitle: string;
  content: string;
  lastModified: number;
  linkedResumeId?: string;
  linkedJobId?: string;
}

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  tags: string[];
}

export interface JobAnalysis {
  role: string;
  company: string;
  keywords: string[];
  requiredSkills: string[];
  cultureFit: string;
  summary: string;
}

export interface JobApplication {
  id: string;
  role: string;
  company: string;
  status: "Saved" | "Applying" | "Interview" | "Offer";
  dateAdded: number;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
  isThinking?: boolean;
  groundingMetadata?: {
    web?: { uri: string; title: string }[];
  };
}

export interface MatchAnalysis {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface ResumeReview {
  overallFeedback: string;
  strengths: string[];
  issues: string[];
  suggestions: string[];
}

export interface CoverLetterReview {
  overallFeedback: string;
  toneAssessment: string;
  suggestions: string[];
  revisedSnippet?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  title: string;
  avatarUrl?: string;
  language?: "en" | "fi";
}

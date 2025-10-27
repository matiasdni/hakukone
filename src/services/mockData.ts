import type {
  ResumeData,
  CoverLetter,
  JobApplication,
  UserProfile,
} from "@/types";

// Sample dates
const now = Date.now();
const oneDay = 24 * 60 * 60 * 1000;
const oneWeek = 7 * oneDay;

// Mock User Profile
export const mockUserProfile: UserProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  title: "Senior Software Engineer",
  language: "en",
};

// Mock Resumes (matching ResumeData interface)
export const mockResumes: ResumeData[] = [
  {
    id: "resume-1",
    lastModified: now - oneDay * 2,
    fullName: "Alex Johnson",
    title: "Senior Software Engineer",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    socialLinks: [
      { platform: "linkedin", url: "linkedin.com/in/alexjohnson" },
      { platform: "github", url: "github.com/alexjohnson" },
      { platform: "portfolio", url: "https://alexjohnson.dev" },
    ],
    summary:
      "Experienced software engineer with 5+ years of expertise in building scalable web applications. Proficient in React, TypeScript, Node.js, and cloud technologies. Passionate about creating efficient, maintainable code and mentoring junior developers.",
    experience: [
      {
        id: "exp-1",
        role: "Senior Software Engineer",
        company: "TechCorp Inc.",
        startDate: "2022-01",
        endDate: "Present",
        current: true,
        description:
          "Led development of microservices architecture serving 1M+ users. Reduced API response times by 40% through optimization. Mentored team of 4 junior developers. Implemented CI/CD pipelines using GitHub Actions.",
      },
      {
        id: "exp-2",
        role: "Software Engineer",
        company: "StartupXYZ",
        startDate: "2019-06",
        endDate: "2021-12",
        current: false,
        description:
          "Built React-based dashboard used by 500+ enterprise clients. Developed RESTful APIs with Node.js and PostgreSQL. Collaborated with design team to implement responsive UI.",
      },
    ],
    education: [
      {
        id: "edu-1",
        degree: "Bachelor of Science in Computer Science",
        school: "University of California, Berkeley",
        year: "2019",
      },
    ],
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "PostgreSQL",
      "MongoDB",
      "AWS",
      "Docker",
      "Kubernetes",
      "Git",
      "CI/CD",
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2023-03",
      },
    ],
    languages: [
      { id: "lang-1", name: "English", level: "Native" },
      { id: "lang-2", name: "Spanish", level: "Intermediate" },
    ],
    customSections: [],
    sectionOrder: [
      { id: "summary", type: "summary" },
      { id: "experience", type: "experience" },
      { id: "education", type: "education" },
      { id: "skills", type: "skills" },
      { id: "certifications", type: "certifications" },
      { id: "languages", type: "languages" },
    ],
    templateId: "modern",
  },
  {
    id: "resume-2",
    lastModified: now - oneDay * 5,
    fullName: "Alex Johnson",
    title: "Product Manager",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    socialLinks: [{ platform: "linkedin", url: "linkedin.com/in/alexjohnson" }],
    summary:
      "Results-driven product manager with a technical background and 3+ years of experience launching successful B2B SaaS products. Expert in user research, roadmap planning, and cross-functional collaboration.",
    experience: [
      {
        id: "exp-pm-1",
        role: "Product Manager",
        company: "SaaSify",
        startDate: "2021-03",
        endDate: "Present",
        current: true,
        description:
          "Owned product roadmap for analytics platform with $2M ARR. Conducted 50+ user interviews to inform feature priorities. Launched 3 major features increasing user retention by 25%.",
      },
    ],
    education: [
      {
        id: "edu-pm-1",
        degree: "MBA in Technology Management",
        school: "Stanford University",
        year: "2021",
      },
    ],
    skills: [
      "Product Strategy",
      "User Research",
      "Agile/Scrum",
      "Data Analysis",
      "SQL",
      "Figma",
      "Jira",
      "A/B Testing",
      "Roadmapping",
    ],
    customSections: [],
    sectionOrder: [
      { id: "summary", type: "summary" },
      { id: "experience", type: "experience" },
      { id: "education", type: "education" },
      { id: "skills", type: "skills" },
    ],
    templateId: "minimal",
  },
  {
    id: "resume-3",
    lastModified: now - oneDay,
    fullName: "Alex Johnson",
    title: "Frontend Developer",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    socialLinks: [
      { platform: "github", url: "github.com/alexjohnson" },
      { platform: "portfolio", url: "https://alexjohnson.dev" },
    ],
    summary:
      "Creative frontend developer specializing in building beautiful, accessible, and performant web experiences. Strong expertise in React, CSS animations, and modern design systems.",
    experience: [
      {
        id: "exp-fe-1",
        role: "Frontend Developer",
        company: "DesignStudio",
        startDate: "2020-02",
        endDate: "Present",
        current: true,
        description:
          "Built component library used across 10+ client projects. Achieved 95+ Lighthouse scores on all production sites. Implemented complex animations using Framer Motion. Led accessibility audit improving WCAG compliance.",
      },
    ],
    education: [
      {
        id: "edu-fe-1",
        degree: "Bachelor of Fine Arts in Design & Technology",
        school: "Parsons School of Design",
        year: "2020",
      },
    ],
    skills: [
      "React",
      "Vue.js",
      "CSS/SCSS",
      "Tailwind CSS",
      "Framer Motion",
      "Three.js",
      "Figma",
      "Accessibility",
      "Performance Optimization",
    ],
    customSections: [],
    sectionOrder: [
      { id: "summary", type: "summary" },
      { id: "experience", type: "experience" },
      { id: "education", type: "education" },
      { id: "skills", type: "skills" },
    ],
    templateId: "creative",
  },
];

// Mock Cover Letters (matching CoverLetter interface)
export const mockCoverLetters: CoverLetter[] = [
  {
    id: "cover-1",
    title: "TechCorp Application",
    jobTitle: "Senior Software Engineer",
    company: "TechCorp Inc.",
    content: `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Software Engineer position at TechCorp Inc. With over 5 years of experience building scalable web applications and a proven track record of leading successful development teams, I am confident I would be a valuable addition to your engineering team.

In my current role, I have successfully led the development of microservices architecture serving over 1 million users, reducing API response times by 40% through strategic optimization. I am particularly drawn to TechCorp's mission of democratizing technology access, and I believe my experience aligns perfectly with your goals.

I would welcome the opportunity to discuss how my skills and experience can contribute to TechCorp's continued success.

Best regards,
Alex Johnson`,
    linkedResumeId: "resume-1",
    lastModified: now - oneDay * 3,
  },
  {
    id: "cover-2",
    title: "StartupABC Application",
    jobTitle: "Full Stack Developer",
    company: "StartupABC",
    content: `Dear StartupABC Team,

I am excited to apply for the Full Stack Developer position. As someone who thrives in fast-paced startup environments, I am eager to contribute to your mission of revolutionizing the fintech space.

My experience spans both frontend and backend development, with particular expertise in React, Node.js, and cloud infrastructure. I am passionate about writing clean, maintainable code and have a strong track record of delivering projects on time.

I look forward to the opportunity to bring my technical skills and entrepreneurial spirit to StartupABC.

Sincerely,
Alex Johnson`,
    linkedResumeId: "resume-1",
    lastModified: now - oneWeek,
  },
];

// Mock Job Applications (matching JobApplication interface)
export const mockJobs: JobApplication[] = [
  {
    id: "job-1",
    role: "Senior Software Engineer",
    company: "TechCorp Inc.",
    status: "Interview",
    dateAdded: now - oneWeek * 2,
    description:
      "We are looking for a Senior Software Engineer to join our growing team. You will be responsible for designing and implementing scalable backend services, mentoring junior developers, and contributing to architectural decisions.",
  },
  {
    id: "job-2",
    role: "Full Stack Developer",
    company: "StartupABC",
    status: "Applying",
    dateAdded: now - oneDay * 10,
    description:
      "Join our small but mighty engineering team! We need a versatile full stack developer who can ship features quickly.",
  },
  {
    id: "job-3",
    role: "Principal Engineer",
    company: "MegaCorp",
    status: "Saved",
    dateAdded: now - oneDay * 5,
    description:
      "Lead technical initiatives across multiple teams. Define architecture standards and mentor senior engineers.",
  },
  {
    id: "job-4",
    role: "Frontend Engineer",
    company: "DesignStudio",
    status: "Offer",
    dateAdded: now - oneWeek * 3,
    description:
      "Build beautiful, responsive web experiences for our clients. Work closely with designers to bring creative visions to life.",
  },
];

// Function to load mock data into the store
export const loadMockData = () => {
  return {
    resumes: mockResumes,
    coverLetters: mockCoverLetters,
    jobs: mockJobs,
    userProfile: mockUserProfile,
  };
};

#!/usr/bin/env tsx
/**
 * Database Seed Script
 *
 * This script seeds the database with mock data for development and testing.
 * Run with: pnpm db:seed
 *
 * Options:
 *   --reset    Drop all data before seeding
 *   --user-id  Specify a user ID (defaults to "dev-user")
 */

import {
    coverLetters,
    jobs,
    resumes,
    userProfiles,
} from "../src/lib/db/schema";
import type {
    CoverLetter,
    JobApplication,
    ResumeData,
    SocialLink,
} from "../src/types";
import { db } from "./db";

// Mock data
const mockResumes: ResumeData[] = [
  {
    id: "resume-1",
    lastModified: Date.now(),
    fullName: "Alex Johnson",
    title: "Senior Software Engineer",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    socialLinks: [
      { platform: "linkedin", url: "linkedin.com/in/alexjohnson" },
      { platform: "github", url: "github.com/alexjohnson" },
    ] as SocialLink[],
    summary:
      "Experienced software engineer with 5+ years of expertise in building scalable web applications.",
    experience: [
      {
        id: "exp-1",
        role: "Senior Software Engineer",
        company: "TechCorp Inc.",
        startDate: "2022-01",
        endDate: "Present",
        current: true,
        description:
          "Led development of microservices architecture serving 1M+ users.",
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
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"],
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
      { id: "languages", type: "languages" },
    ],
    templateId: "modern",
  },
  {
    id: "resume-2",
    lastModified: Date.now(),
    fullName: "Alex Johnson",
    title: "Product Manager",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    socialLinks: [],
    summary: "Results-driven product manager with a technical background.",
    experience: [
      {
        id: "exp-pm-1",
        role: "Product Manager",
        company: "SaaSify",
        startDate: "2021-03",
        endDate: "Present",
        current: true,
        description:
          "Owned product roadmap for analytics platform with $2M ARR.",
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
    skills: ["Product Strategy", "User Research", "Agile/Scrum", "SQL"],
    customSections: [],
    sectionOrder: [
      { id: "summary", type: "summary" },
      { id: "experience", type: "experience" },
      { id: "education", type: "education" },
      { id: "skills", type: "skills" },
    ],
    templateId: "minimal",
  },
];

const mockCoverLetters: CoverLetter[] = [
  {
    id: "cover-1",
    title: "TechCorp Application",
    jobTitle: "Senior Software Engineer",
    company: "TechCorp Inc.",
    content: `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Software Engineer position at TechCorp Inc.

Best regards,
Alex Johnson`,
    linkedResumeId: "resume-1",
    lastModified: Date.now(),
  },
];

const mockJobs: JobApplication[] = [
  {
    id: "job-1",
    role: "Senior Software Engineer",
    company: "TechCorp Inc.",
    status: "Interview",
    dateAdded: Date.now(),
    description: "Looking for a Senior Software Engineer to join our team.",
  },
  {
    id: "job-2",
    role: "Full Stack Developer",
    company: "StartupABC",
    status: "Applying",
    dateAdded: Date.now(),
    description: "Join our small but mighty engineering team!",
  },
];

async function parseArgs() {
  const args = process.argv.slice(2);
  return {
    reset: args.includes("--reset"),
    userId:
      args.find((a) => a.startsWith("--user-id="))?.split("=")[1] || "dev-user",
  };
}

async function resetDatabase() {
  console.log("🗑️  Resetting database...");

  // Delete in order due to foreign key constraints
  await db.delete(coverLetters);
  await db.delete(jobs);
  await db.delete(resumes);
  // Don't delete users - they may have real auth data

  console.log("✅ Database reset complete");
}

async function seed(userId: string) {
  console.log(`\n🌱 Seeding database for user: ${userId}\n`);

  // Ensure user profile exists (the user must first sign in via Stack Auth)
  // For development, we create a profile directly
  await db
    .insert(userProfiles)
    .values({
      userId,
    })
    .onConflictDoNothing();

  console.log("👤 User profile ensured");

  // Insert resumes
  for (const resume of mockResumes) {
    await db
      .insert(resumes)
      .values({
        id: resume.id,
        userId,
        data: resume,
        templateId: resume.templateId,
      })
      .onConflictDoUpdate({
        target: resumes.id,
        set: { data: resume, templateId: resume.templateId },
      });
  }
  console.log(`📄 Seeded ${mockResumes.length} resumes`);

  // Insert cover letters
  for (const letter of mockCoverLetters) {
    await db
      .insert(coverLetters)
      .values({
        id: letter.id,
        userId,
        data: letter,
        linkedResumeId: letter.linkedResumeId,
      })
      .onConflictDoUpdate({
        target: coverLetters.id,
        set: { data: letter, linkedResumeId: letter.linkedResumeId },
      });
  }
  console.log(`✉️  Seeded ${mockCoverLetters.length} cover letters`);

  // Insert jobs
  for (const job of mockJobs) {
    await db
      .insert(jobs)
      .values({
        id: job.id,
        userId,
        data: job,
      })
      .onConflictDoUpdate({
        target: jobs.id,
        set: { data: job },
      });
  }
  console.log(`💼 Seeded ${mockJobs.length} jobs`);

  console.log("\n✅ Seeding complete!\n");
}

async function main() {
  const { reset, userId } = await parseArgs();

  console.log("🚀 Database Seed Script");
  console.log("========================\n");

  if (reset) {
    await resetDatabase();
  }

  await seed(userId);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

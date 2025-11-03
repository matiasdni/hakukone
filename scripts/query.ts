#!/usr/bin/env tsx
import {
    coverLetters,
    jobs,
    resumes,
    userProfiles,
} from "../src/lib/db/schema";
import { db } from "./db";

async function main() {
  console.log("📊 Database Contents\n");
  console.log("=".repeat(50));

  // User profiles
  const profiles = await db.select().from(userProfiles);
  console.log(`\n👤 User Profiles (${profiles.length}):`);
  for (const profile of profiles) {
    console.log(`   - ${profile.userId} (${profile.plan})`);
  }

  // Resumes
  const allResumes = await db.select().from(resumes);
  console.log(`\n📄 Resumes (${allResumes.length}):`);
  for (const resume of allResumes) {
    const data = resume.data as { fullName?: string; title?: string };
    console.log(`   - [${resume.id}] ${data.fullName || "Untitled"} - ${data.title || "No title"}`);
    console.log(`     User: ${resume.userId}, Template: ${resume.templateId}`);
  }

  // Cover Letters
  const letters = await db.select().from(coverLetters);
  console.log(`\n✉️  Cover Letters (${letters.length}):`);
  for (const letter of letters) {
    const data = letter.data as { title?: string; company?: string };
    console.log(`   - [${letter.id}] ${data.title || "Untitled"} - ${data.company || "No company"}`);
    console.log(`     User: ${letter.userId}`);
  }

  // Jobs
  const allJobs = await db.select().from(jobs);
  console.log(`\n💼 Jobs (${allJobs.length}):`);
  for (const job of allJobs) {
    const data = job.data as { role?: string; company?: string; status?: string };
    console.log(`   - [${job.id}] ${data.role || "Untitled"} at ${data.company || "Unknown"}`);
    console.log(`     User: ${job.userId}, Status: ${data.status || "N/A"}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Query complete\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Query failed:", err);
  process.exit(1);
});

import type { TemplateOverrides } from "@/lib/templates/types";
import type { CoverLetter, JobApplication, ResumeData } from "@/types";
import {
  boolean,
  index,
  jsonb,
  pgSchema,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

/**
 * Neon Auth schema - automatically managed by Neon
 * This table is created and synced automatically when you enable Neon Auth
 * See: https://neon.com/docs/guides/neon-auth
 */
const neonAuthSchema = pgSchema("neon_auth");

/**
 * Users table managed by Neon Auth
 * User data is automatically synced from Stack Auth - no webhooks or manual sync needed!
 */
export const usersSync = neonAuthSchema.table("users_sync", {
  id: text("id").primaryKey(), // Stack Auth user ID
  name: text("name"),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  rawJson: jsonb("raw_json"), // Full raw user data from Stack Auth
});

/**
 * Application-specific user data (subscription, plan, etc.)
 * References the Neon Auth users_sync table
 */
export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id").primaryKey(), // References neon_auth.users_sync.id
  plan: text("plan").notNull().default("free"),
  // Stripe subscription fields
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionId: text("subscription_id"),
  subscriptionTier: text("subscription_tier").default("free"),
  subscriptionStatus: text("subscription_status"),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end", {
    withTimezone: true,
  }),
  ...timestamps,
});

// Keep the old users table for backward compatibility during migration
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Auth user ID
  email: text("email").notNull(),
  name: text("name"),
  plan: text("plan").notNull().default("free"),
  // Stripe subscription fields
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionId: text("subscription_id"),
  subscriptionTier: text("subscription_tier").default("free"),
  subscriptionStatus: text("subscription_status"),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end", {
    withTimezone: true,
  }),
  ...timestamps,
});

export const resumes = pgTable(
  "resumes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(), // References auth user ID (from neon_auth.users_sync or userProfiles)
    data: jsonb("data").$type<ResumeData>().notNull(),
    templateId: text("template_id").default("modern"),
    linkedJobId: text("linked_job_id"),
    isArchived: boolean("is_archived").notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("resumes_user_idx").on(table.userId),
  })
);

export const coverLetters = pgTable(
  "cover_letters",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(), // References auth user ID
    data: jsonb("data").$type<CoverLetter>().notNull(),
    linkedResumeId: text("linked_resume_id"),
    linkedJobId: text("linked_job_id"),
    isArchived: boolean("is_archived").notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("cover_letters_user_idx").on(table.userId),
  })
);

export const jobs = pgTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(), // References auth user ID
    data: jsonb("data").$type<JobApplication>().notNull(),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("jobs_user_idx").on(table.userId),
  })
);

export const designOverrides = pgTable(
  "design_overrides",
  {
    id: text("id").primaryKey(),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(), // References auth user ID
    templateId: text("template_id").notNull().default("modern"),
    overrides: jsonb("overrides").$type<TemplateOverrides>().notNull(),
    ...timestamps,
  },
  (table) => ({
    resumeIdx: index("design_overrides_resume_idx").on(table.resumeId),
    userIdx: index("design_overrides_user_idx").on(table.userId),
  })
);

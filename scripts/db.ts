/**
 * Database client for scripts (bypasses strict env validation)
 */
import { config } from "dotenv";
// Load environment variables first
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  console.error("   Make sure you have a .env.local file with DATABASE_URL=...");
  process.exit(1);
}

const neonClient = neon(DATABASE_URL);
export const db = drizzle(neonClient, { schema });

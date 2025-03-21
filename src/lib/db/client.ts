import { env } from "@/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const neonClient = neon(env.DATABASE_URL);

export const db = drizzle(neonClient, { schema });
export type DbClient = typeof db;

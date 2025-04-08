"use server";

import { stackServerApp } from "@/app/stack/server";
import { db } from "@/lib/db/client";
import { userProfiles, usersSync } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ============================================
// Stack Auth + Neon Auth (auto-synced users)
// ============================================

/**
 * Get the current user's ID or throw if not authenticated
 */
export async function requireUserId() {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) {
    throw new Error("Unauthorized");
  }
  return stackUser.id;
}

/**
 * Get the current authenticated user's basic info
 */
export async function getSessionUser() {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) return null;
  
  return {
    id: stackUser.id,
    email: stackUser.primaryEmail,
    name: stackUser.displayName,
  };
}

// ============================================
// Neon Auth (Stack Auth with auto-sync)
// ============================================

/**
 * Get the current authenticated Stack Auth user
 * User data is automatically synced to neon_auth.users_sync by Neon Auth
 */
export async function getStackUser() {
  return stackServerApp.getUser();
}

/**
 * Get the current authenticated user (requires auth, redirects if not authenticated)
 */
export async function requireStackUser() {
  return stackServerApp.getUser({ or: "redirect" });
}

/**
 * Get user data from the Neon Auth synced table
 * This is the user data that Neon Auth automatically syncs from Stack Auth
 */
export async function getNeonAuthUser(userId: string) {
  return db.query.usersSync.findFirst({
    where: eq(usersSync.id, userId),
  });
}

/**
 * Get or create a user profile with application-specific data (plan, subscription, etc.)
 * This is separate from the Neon Auth synced user data
 */
export async function getUserProfile(userId: string) {
  let profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  // Create profile if it doesn't exist
  if (!profile) {
    const [newProfile] = await db
      .insert(userProfiles)
      .values({ userId })
      .returning();
    profile = newProfile;
  }

  return profile;
}

/**
 * Get full user info: Stack Auth user + Neon Auth synced data + app profile
 */
export async function getFullUserInfo() {
  const stackUser = await getStackUser();
  
  if (!stackUser) {
    return null;
  }

  const [neonUser, profile] = await Promise.all([
    getNeonAuthUser(stackUser.id),
    getUserProfile(stackUser.id),
  ]);

  return {
    stackUser,
    neonUser,
    profile,
  };
}

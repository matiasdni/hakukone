"use server";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { stripe, SUBSCRIPTION_TIERS, type SubscriptionTier } from "./client";

// Create Checkout Session
export async function createCheckoutSession(priceId: string) {
  const userId = await requireUserId();
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  // Get or create customer
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  let customerId = user?.stripeCustomerId;

  if (!customerId) {
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      metadata: {
        userId,
      },
    });
    customerId = customer.id;

    // Save customer ID to database
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId));
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${origin}/settings?success=true`,
    cancel_url: `${origin}/settings?canceled=true`,
    metadata: {
      userId,
    },
  });

  return { url: session.url };
}

// Create Billing Portal Session
export async function createBillingPortalSession() {
  const userId = await requireUserId();
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  // Get customer ID from database
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user?.stripeCustomerId) {
    throw new Error("No subscription found");
  }

  // Create portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/settings`,
  });

  return { url: session.url };
}

// Get subscription status
export async function getSubscriptionStatus(): Promise<{
  tier: SubscriptionTier;
  status: string | null;
  currentPeriodEnd: Date | null;
}> {
  const userId = await requireUserId();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    tier:
      (user?.subscriptionTier as SubscriptionTier) || SUBSCRIPTION_TIERS.FREE,
    status: user?.subscriptionStatus || null,
    currentPeriodEnd: user?.subscriptionCurrentPeriodEnd || null,
  };
}

// Check if user has access to a feature
export async function hasFeatureAccess(
  feature: "unlimited_resumes" | "ai_writer" | "cover_letters" | "team"
): Promise<boolean> {
  const { tier } = await getSubscriptionStatus();

  switch (feature) {
    case "unlimited_resumes":
    case "ai_writer":
    case "cover_letters":
      return (
        tier === SUBSCRIPTION_TIERS.PRO || tier === SUBSCRIPTION_TIERS.TEAM
      );
    case "team":
      return tier === SUBSCRIPTION_TIERS.TEAM;
    default:
      return false;
  }
}

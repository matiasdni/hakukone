import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PRO: "pro",
  TEAM: "team",
} as const;

export type SubscriptionTier =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

// Price IDs from Stripe Dashboard - update these with your actual price IDs
export const PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_pro_monthly",
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "price_pro_yearly",
  TEAM_MONTHLY:
    process.env.STRIPE_TEAM_MONTHLY_PRICE_ID || "price_team_monthly",
  TEAM_YEARLY: process.env.STRIPE_TEAM_YEARLY_PRICE_ID || "price_team_yearly",
} as const;

// Get tier from price ID
export function getTierFromPriceId(priceId: string): SubscriptionTier {
  if (priceId === PRICE_IDS.PRO_MONTHLY || priceId === PRICE_IDS.PRO_YEARLY) {
    return SUBSCRIPTION_TIERS.PRO;
  }
  if (priceId === PRICE_IDS.TEAM_MONTHLY || priceId === PRICE_IDS.TEAM_YEARLY) {
    return SUBSCRIPTION_TIERS.TEAM;
  }
  return SUBSCRIPTION_TIERS.FREE;
}

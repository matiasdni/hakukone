import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getTierFromPriceId, stripe } from "@/lib/stripe/client";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }

  // Get subscription details
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    await updateUserSubscription(userId, subscription);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Get user ID from customer metadata
  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  );

  if (customer.deleted) {
    console.error("Customer was deleted");
    return;
  }

  const userId = customer.metadata?.userId;
  if (!userId) {
    // Try to find user by customer ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, subscription.customer as string))
      .limit(1);

    if (user) {
      await updateUserSubscription(user.id, subscription);
    } else {
      console.error("Could not find user for subscription");
    }
    return;
  }

  await updateUserSubscription(userId, subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Find user by subscription ID and downgrade to free
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.subscriptionId, subscription.id))
    .limit(1);

  if (user) {
    await db
      .update(users)
      .set({
        subscriptionId: null,
        subscriptionTier: "free",
        subscriptionStatus: "canceled",
        subscriptionCurrentPeriodEnd: null,
      })
      .where(eq(users.id, user.id));

    console.log(`User ${user.id} subscription canceled`);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Find user and update subscription status
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, invoice.customer as string))
    .limit(1);

  if (user) {
    await db
      .update(users)
      .set({
        subscriptionStatus: "past_due",
      })
      .where(eq(users.id, user.id));

    console.log(`User ${user.id} payment failed`);
    // TODO: Send email notification
  }
}

async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id;
  const tier = priceId ? getTierFromPriceId(priceId) : "free";

  await db
    .update(users)
    .set({
      subscriptionId: subscription.id,
      subscriptionTier: tier,
      subscriptionStatus: subscription.status,
      subscriptionCurrentPeriodEnd: new Date(
        (subscription as unknown as { current_period_end: number })
          .current_period_end * 1000
      ),
    })
    .where(eq(users.id, userId));

  console.log(`Updated user ${userId} to tier: ${tier}`);
}

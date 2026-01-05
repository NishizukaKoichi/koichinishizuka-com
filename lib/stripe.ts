import Stripe from "stripe";
import { billingConfig } from "../config/billing";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  stripeClient = new Stripe(secretKey, {
    apiVersion: "2024-06-20",
  });
  return stripeClient;
}

export function verifyStripeWebhook(payload: string, signature: string | null): Stripe.Event {
  if (!signature) {
    throw new Error("Missing Stripe-Signature header");
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}

export async function createCheckoutSession(options: {
  userId: string;
  planKey: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const { userId, planKey, priceId, successUrl, cancelUrl } = options;
  const metadata = { planKey, userId };

  const mode = billingConfig.mode === "subscription" ? "subscription" : "payment";

  return getStripe().checkout.sessions.create({
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata,
    line_items: [{ price: priceId, quantity: 1 }],
    ...(mode === "subscription"
      ? { subscription_data: { metadata } }
      : { payment_intent_data: { metadata } }),
  });
}

export async function createCustomerPortalSession(options: {
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const { stripeCustomerId, returnUrl } = options;
  return getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
}

export async function createStripePrice(options: {
  planKey: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
}): Promise<Stripe.Price> {
  const { planKey, amount, currency, interval } = options;
  return getStripe().prices.create({
    unit_amount: amount,
    currency,
    recurring: billingConfig.mode === "subscription" ? { interval } : undefined,
    product_data: {
      name: `Plan ${planKey}`,
      metadata: { planKey },
    },
    metadata: { planKey },
  });
}

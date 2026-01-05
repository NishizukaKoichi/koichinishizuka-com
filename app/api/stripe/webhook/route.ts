import { NextResponse } from "next/server";
import { verifyStripeWebhook } from "../../../../lib/stripe";
import { setEntitlementFromStripeEvent } from "../../../../lib/entitlements";
import { track } from "../../../../lib/analytics";

export const runtime = "nodejs";

type EventObject = {
  metadata?: Record<string, string>;
  client_reference_id?: string;
};

type StripeEventLike = {
  type: string;
  data?: {
    object?: EventObject;
  };
};

function getPlanKey(event: StripeEventLike): string | null {
  return event?.data?.object?.metadata?.planKey ?? null;
}

function getUserId(event: StripeEventLike): string | null {
  const metadataUser = event?.data?.object?.metadata?.userId;
  return metadataUser ?? event?.data?.object?.client_reference_id ?? null;
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: StripeEventLike;
  try {
    event = verifyStripeWebhook(payload, signature) as StripeEventLike;
  } catch (error) {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const planKey = getPlanKey(event);
    const userId = getUserId(event);
    if (!planKey || !userId) {
      return NextResponse.json({ error: "Missing metadata.planKey or userId" }, { status: 400 });
    }

    const entitlement = await setEntitlementFromStripeEvent(userId, event);
    track("checkout_completed", { planKey, userId });
    if (entitlement) {
      track("entitlement_granted", { planKey, userId });
    }
  }

  if (event.type === "invoice.payment_failed") {
    const planKey = getPlanKey(event);
    const userId = getUserId(event);
    track("payment_failed", { planKey, userId });
  }

  if (event.type === "customer.subscription.deleted") {
    const planKey = getPlanKey(event);
    const userId = getUserId(event);
    if (!planKey || !userId) {
      return NextResponse.json({ error: "Missing metadata.planKey or userId" }, { status: 400 });
    }

    const entitlement = await setEntitlementFromStripeEvent(userId, event);
    if (entitlement) {
      track("entitlement_revoked", { planKey, userId });
    }
  }

  // Webhook is the source of truth. Return URLs are not payment confirmation.
  return NextResponse.json({ received: true });
}

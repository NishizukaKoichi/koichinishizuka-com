import { NextResponse } from "next/server";
import { billingConfig } from "../../../../config/billing";
import { listPlans, getActivePriceIdForPlan } from "../../../../lib/plans";
import { createCheckoutSession } from "../../../../lib/stripe";
import { track } from "../../../../lib/analytics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const planKey = body?.planKey as string | undefined;
  const userId = body?.userId as string | undefined;

  if (!planKey || !userId) {
    return NextResponse.json({ error: "planKey and userId are required" }, { status: 400 });
  }

  const plans = await listPlans();
  const plan = plans.find((item) => item.planKey === planKey);
  if (!plan) {
    return NextResponse.json({ error: "Unknown planKey" }, { status: 404 });
  }
  if (!plan.requireEntitlement) {
    return NextResponse.json({ error: "Plan does not require checkout" }, { status: 400 });
  }

  const priceId = await getActivePriceIdForPlan(planKey);
  if (!priceId) {
    return NextResponse.json({ error: "Active price not set for plan" }, { status: 409 });
  }

  const baseUrl = process.env.APP_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "Missing APP_BASE_URL" }, { status: 500 });
  }

  // Do not treat return URLs as payment confirmation. Webhook is the source of truth.
  const session = await createCheckoutSession({
    userId,
    planKey,
    priceId,
    successUrl: `${baseUrl}${billingConfig.successPath}`,
    cancelUrl: `${baseUrl}${billingConfig.cancelPath}`,
  });

  track("checkout_started", { planKey, userId, sessionId: session.id });

  return NextResponse.json({ url: session.url });
}

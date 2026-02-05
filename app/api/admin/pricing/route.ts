import { NextResponse } from "next/server";
import { billingConfig } from "../../../../config/billing";
import { listPlans, listActivePrices, setActivePriceIdForPlan } from "../../../../lib/plans";
import { createStripePrice } from "../../../../lib/stripe";
import { getServerUserEmail } from "../../../../lib/auth/server";

export const runtime = "nodejs";

type AdminCheck = { ok: true } | { ok: false; error: string; status: number };

function parseAllowlist(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function assertAdmin(): Promise<AdminCheck> {
  const email = await getServerUserEmail();
  const emailAllowlist = parseAllowlist(process.env.ADMIN_EMAIL_ALLOWLIST);
  const domainAllowlist = parseAllowlist(process.env.ADMIN_DOMAIN_ALLOWLIST);

  if (emailAllowlist.length === 0 && domainAllowlist.length === 0) {
    return { ok: false, error: "Admin allowlist is not configured", status: 503 };
  }

  if (!email) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  if (emailAllowlist.includes(email)) {
    return { ok: true };
  }

  const domain = email.split("@")[1];
  if (domain && domainAllowlist.includes(domain)) {
    return { ok: true };
  }

  return { ok: false, error: "Admin access denied", status: 403 };
}

export async function GET() {
  const adminCheck = await assertAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const plans = await listPlans();
  const activePrices = await listActivePrices();

  return NextResponse.json({ plans, activePrices });
}

export async function POST(request: Request) {
  const adminCheck = await assertAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const body = await request.json();
  const planKey = body?.planKey as string | undefined;
  const amount = Number(body?.amount);
  const currency = body?.currency as string | undefined;
  const interval = body?.interval as "month" | "year" | undefined;

  if (!planKey || !currency || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "planKey, amount, and currency are required" }, { status: 400 });
  }

  const planExists = (await listPlans()).some((plan) => plan.planKey === planKey);
  if (!planExists) {
    return NextResponse.json({ error: "Unknown planKey" }, { status: 404 });
  }

  if (billingConfig.mode === "subscription" && !interval) {
    return NextResponse.json({ error: "interval is required for subscriptions" }, { status: 400 });
  }

  const price = await createStripePrice({
    planKey,
    amount,
    currency,
    interval: interval ?? "month",
  });

  await setActivePriceIdForPlan(planKey, price.id);

  return NextResponse.json({ priceId: price.id });
}

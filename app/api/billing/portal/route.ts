import { NextResponse } from "next/server";
import { createCustomerPortalSession } from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const stripeCustomerId = body?.stripeCustomerId as string | undefined;
  const returnPath = (body?.returnPath as string | undefined) ?? "/dashboard";

  if (!stripeCustomerId) {
    return NextResponse.json({ error: "stripeCustomerId is required" }, { status: 400 });
  }

  const baseUrl = process.env.APP_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "Missing APP_BASE_URL" }, { status: 500 });
  }

  const session = await createCustomerPortalSession({
    stripeCustomerId,
    returnUrl: `${baseUrl}${returnPath}`,
  });

  return NextResponse.json({ url: session.url });
}

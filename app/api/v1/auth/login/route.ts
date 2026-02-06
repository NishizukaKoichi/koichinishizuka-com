import { NextResponse } from "next/server";
import { getRequestUserEmail, getRequestUserId } from "../../../../../lib/platform/request";

export const runtime = "nodejs";

function normalize(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const bodyUserId = normalize(body?.user_id as string | undefined);
  const bodyEmail = normalize(body?.email as string | undefined);

  const userId = bodyUserId ?? getRequestUserId(request);
  const email = bodyEmail ?? getRequestUserEmail(request);

  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const secure = isProduction();
  const response = NextResponse.json({ user_id: userId, email: email ?? null });

  response.cookies.set("user_id", userId, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  if (email) {
    response.cookies.set("user_email", email, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function POST() {
  const secure = isProduction();
  const response = NextResponse.json({ status: "ok" });

  for (const key of ["user_id", "user_email", "x-user-id", "x-user-email"]) {
    response.cookies.set(key, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}

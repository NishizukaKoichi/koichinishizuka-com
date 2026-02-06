import { NextResponse } from "next/server";
import { getServerUserEmail, getServerUserId } from "../../../../../lib/auth/server";

export const runtime = "nodejs";

function parseAllowlist(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isAdmin(email: string | null): boolean {
  if (!email) return false;
  const emailAllowlist = parseAllowlist(process.env.ADMIN_EMAIL_ALLOWLIST);
  const domainAllowlist = parseAllowlist(process.env.ADMIN_DOMAIN_ALLOWLIST);

  if (emailAllowlist.includes(email)) return true;

  const domain = email.split("@")[1];
  if (!domain) return false;
  return domainAllowlist.includes(domain);
}

export async function GET() {
  const userId = await getServerUserId();
  const email = await getServerUserEmail();

  return NextResponse.json({
    user_id: userId,
    email,
    is_logged_in: Boolean(userId),
    is_admin: isAdmin(email),
  });
}

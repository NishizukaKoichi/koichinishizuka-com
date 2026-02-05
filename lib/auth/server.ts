import { cookies, headers } from "next/headers";
import { type AuthIdentity, extractSupabaseIdentityFromCookies } from "./supabase-session";

const FALLBACK_USER_ID = process.env.DEFAULT_USER_ID?.trim() ?? null;
const FALLBACK_USER_EMAIL = process.env.DEFAULT_USER_EMAIL?.trim() ?? null;
const INTERNAL_REQUEST_SECRET = process.env.INTERNAL_REQUEST_SECRET?.trim() ?? null;
const ALLOW_DEV_HEADER_AUTH = process.env.ALLOW_DEV_HEADER_AUTH === "1";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function canTrustForwardedHeaders(headerStore: Awaited<ReturnType<typeof headers>>): boolean {
  if (INTERNAL_REQUEST_SECRET) {
    return headerStore.get("x-internal-auth") === INTERNAL_REQUEST_SECRET;
  }
  if (isProduction()) {
    return false;
  }
  return ALLOW_DEV_HEADER_AUTH;
}

function normalize(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function getIdentityFromTrustedHeaders(): Promise<AuthIdentity | null> {
  const headerStore = await headers();
  if (!canTrustForwardedHeaders(headerStore)) return null;

  const userId = normalize(headerStore.get("x-user-id") ?? headerStore.get("x-user"));
  if (!userId) return null;

  const email = normalize(headerStore.get("x-user-email"));
  return { userId, email };
}

async function getIdentityFromCookies(): Promise<AuthIdentity | null> {
  const cookieStore = await cookies();

  const explicitUserId =
    normalize(cookieStore.get("x-user-id")?.value) ?? normalize(cookieStore.get("user_id")?.value);
  if (explicitUserId) {
    const explicitEmail =
      normalize(cookieStore.get("x-user-email")?.value) ?? normalize(cookieStore.get("user_email")?.value);
    return { userId: explicitUserId, email: explicitEmail };
  }

  return extractSupabaseIdentityFromCookies(cookieStore.getAll());
}

export async function getServerAuthIdentity(): Promise<AuthIdentity | null> {
  const fromHeader = await getIdentityFromTrustedHeaders();
  if (fromHeader) return fromHeader;

  const fromCookie = await getIdentityFromCookies();
  if (fromCookie) return fromCookie;

  if (!isProduction() && FALLBACK_USER_ID) {
    return { userId: FALLBACK_USER_ID, email: FALLBACK_USER_EMAIL };
  }

  return null;
}

export async function getServerUserId(): Promise<string | null> {
  const identity = await getServerAuthIdentity();
  return identity?.userId ?? null;
}

export async function getServerUserEmail(): Promise<string | null> {
  const identity = await getServerAuthIdentity();
  return identity?.email ?? null;
}

import { extractSupabaseIdentityFromCookieHeader } from "../auth/supabase-session";

const INTERNAL_REQUEST_SECRET = process.env.INTERNAL_REQUEST_SECRET?.trim() ?? null;
const ALLOW_DEV_HEADER_AUTH = process.env.ALLOW_DEV_HEADER_AUTH === "1";

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!header) {
    return null;
  }
  const [scheme, value] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !value) {
    return null;
  }
  return value.trim();
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function canTrustForwardedHeaders(request: Request): boolean {
  if (INTERNAL_REQUEST_SECRET) {
    return request.headers.get("x-internal-auth") === INTERNAL_REQUEST_SECRET;
  }
  if (isProduction()) {
    return false;
  }
  return ALLOW_DEV_HEADER_AUTH;
}

function normalize(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getCookieValue(request: Request, key: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const name = trimmed.slice(0, i).trim();
    if (name !== key) continue;
    return trimmed.slice(i + 1).trim();
  }

  return null;
}

export function getRequestUserId(request: Request): string | null {
  const cookieUserId = normalize(getCookieValue(request, "x-user-id") ?? getCookieValue(request, "user_id"));
  if (cookieUserId) {
    return cookieUserId;
  }

  const supabaseIdentity = extractSupabaseIdentityFromCookieHeader(request.headers.get("cookie"));
  if (supabaseIdentity) {
    return supabaseIdentity.userId;
  }

  if (!canTrustForwardedHeaders(request)) {
    return null;
  }

  const header =
    request.headers.get("x-user-id") ??
    request.headers.get("x-user");
  return normalize(header);
}

export function getRequestUserEmail(request: Request): string | null {
  const cookieEmail = normalize(
    getCookieValue(request, "x-user-email") ?? getCookieValue(request, "user_email")
  );
  if (cookieEmail) {
    return cookieEmail;
  }

  const supabaseIdentity = extractSupabaseIdentityFromCookieHeader(request.headers.get("cookie"));
  if (supabaseIdentity?.email) {
    return supabaseIdentity.email;
  }

  if (!canTrustForwardedHeaders(request)) {
    return null;
  }

  return normalize(request.headers.get("x-user-email"));
}

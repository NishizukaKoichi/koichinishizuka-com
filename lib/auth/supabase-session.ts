const AUTH_COOKIE_REGEX = /^sb-[a-z0-9-]+-auth-token(\.\d+)?$/i;

export type AuthIdentity = {
  userId: string;
  email: string | null;
};

type AuthSession = {
  user?: {
    id?: string;
    email?: string;
  };
};

function decodeSupabaseSession(rawValue: string): AuthSession | null {
  let value = rawValue;
  if (value.startsWith("base64-")) {
    value = value.slice("base64-".length);
    try {
      value = Buffer.from(value, "base64").toString("utf8");
    } catch {
      return null;
    }
  }

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    return null;
  }
}

function toIdentity(session: AuthSession | null): AuthIdentity | null {
  const userId = session?.user?.id?.trim();
  if (!userId) return null;
  const email = session?.user?.email?.trim() ?? null;
  return { userId, email: email && email.length > 0 ? email : null };
}

export function extractSupabaseIdentityFromCookies(
  cookieEntries: Array<{ name: string; value: string }>
): AuthIdentity | null {
  const authCookies = cookieEntries.filter((cookie) => AUTH_COOKIE_REGEX.test(cookie.name));
  if (authCookies.length === 0) return null;

  const grouped = new Map<string, { index: number; value: string }[]>();
  for (const cookie of authCookies) {
    const match = cookie.name.match(/^(sb-[a-z0-9-]+-auth-token)(?:\.(\d+))?$/i);
    if (!match) continue;
    const base = match[1];
    const index = match[2] ? Number(match[2]) : 0;
    const entry = grouped.get(base) ?? [];
    entry.push({ index, value: cookie.value });
    grouped.set(base, entry);
  }

  for (const chunks of grouped.values()) {
    const ordered = [...chunks].sort((a, b) => a.index - b.index);
    const joined = ordered.map((chunk) => chunk.value).join("");
    const identity = toIdentity(decodeSupabaseSession(joined));
    if (identity) return identity;
  }

  return null;
}

export function extractSupabaseIdentityFromCookieHeader(
  cookieHeader: string | null
): AuthIdentity | null {
  if (!cookieHeader) return null;

  const cookieEntries: Array<{ name: string; value: string }> = [];
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const name = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    cookieEntries.push({ name, value });
  }

  return extractSupabaseIdentityFromCookies(cookieEntries);
}

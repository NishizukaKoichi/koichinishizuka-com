import { cookies, headers } from "next/headers";

const FALLBACK_USER_ID =
  process.env.DEFAULT_USER_ID ?? "00000000-0000-0000-0000-000000000000";

export function getServerUserId(): string | null {
  const header = headers().get("x-user-id") ?? headers().get("x-user");
  const cookie =
    cookies().get("x-user-id")?.value ?? cookies().get("user_id")?.value;
  const value = header ?? cookie ?? FALLBACK_USER_ID;
  return value && value.length > 0 ? value : null;
}

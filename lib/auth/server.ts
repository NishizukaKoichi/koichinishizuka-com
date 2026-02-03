import { cookies, headers } from "next/headers";

const FALLBACK_USER_ID =
  process.env.DEFAULT_USER_ID ?? "00000000-0000-0000-0000-000000000000";

export async function getServerUserId(): Promise<string | null> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const header = headerStore.get("x-user-id") ?? headerStore.get("x-user");
  const cookie =
    cookieStore.get("x-user-id")?.value ?? cookieStore.get("user_id")?.value;
  const value = header ?? cookie ?? FALLBACK_USER_ID;
  return value && value.length > 0 ? value : null;
}

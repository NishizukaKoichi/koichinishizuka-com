import { getServerAuthIdentity } from "@/lib/auth/server";

type ExecAccessOk = { ok: true; userId: string };
type ExecAccessDeniedReason = "unauthenticated" | "forbidden" | "not_configured";
type ExecAccessDenied = {
  ok: false;
  reason: ExecAccessDeniedReason;
  message: string;
};

export type ExecAccess = ExecAccessOk | ExecAccessDenied;

const parseAllowlist = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const getAllowlist = (primary: string | undefined, fallback: string | undefined) => {
  const parsed = parseAllowlist(primary);
  if (parsed.length > 0) return parsed;
  return parseAllowlist(fallback);
};

const isEmailAllowed = (
  email: string,
  emailAllowlist: string[],
  domainAllowlist: string[],
): boolean => {
  if (!email) return false;
  if (emailAllowlist.includes(email)) return true;
  const domain = email.split("@")[1];
  return Boolean(domain && domainAllowlist.includes(domain));
};

export async function getExecAccess(): Promise<ExecAccess> {
  const identity = await getServerAuthIdentity();
  if (!identity?.userId) {
    return {
      ok: false,
      reason: "unauthenticated",
      message: "Login is required to access execution tools.",
    };
  }

  const userId = identity.userId;
  const email = identity.email ?? "";

  const userAllowlist = parseAllowlist(process.env.EXEC_USER_ID_ALLOWLIST);
  const emailAllowlist = getAllowlist(
    process.env.EXEC_EMAIL_ALLOWLIST,
    process.env.ADMIN_EMAIL_ALLOWLIST,
  );
  const domainAllowlist = getAllowlist(
    process.env.EXEC_DOMAIN_ALLOWLIST,
    process.env.ADMIN_DOMAIN_ALLOWLIST,
  );

  const hasAllowlist =
    userAllowlist.length > 0 || emailAllowlist.length > 0 || domainAllowlist.length > 0;

  if (!hasAllowlist) {
    return {
      ok: false,
      reason: "not_configured",
      message: "Exec access allowlist is not configured.",
    };
  }

  if (userAllowlist.includes(userId)) {
    return { ok: true, userId };
  }

  if (isEmailAllowed(email, emailAllowlist, domainAllowlist)) {
    return { ok: true, userId };
  }

  return {
    ok: false,
    reason: "forbidden",
    message: "Exec access denied for this user.",
  };
}

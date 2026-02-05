import { NextResponse } from "next/server";
import { getBearerToken } from "../../../../lib/platform/request";
import { getKeyBySecret, touchDeveloperKey } from "../../../../lib/platform/keys";
import { issueTokens } from "../../../../lib/platform/tokens";
import { recordMeterEvent } from "../../../../lib/platform/meter";

export const runtime = "nodejs";

function resolveTokenIssueStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : "Failed to issue token";
  if (message.includes("Invalid developer key")) return 401;
  if (message.includes("revoked")) return 403;
  if (message.includes("No active entitlements")) return 403;
  return 400;
}

export async function POST(request: Request) {
  const developerKey = getBearerToken(request);
  if (!developerKey) {
    return NextResponse.json({ error: "Developer key is required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const requestedScopes = Array.isArray(body?.scopes) ? (body.scopes as string[]) : undefined;

  try {
    const key = await getKeyBySecret(developerKey);
    if (key.status !== "active") {
      return NextResponse.json({ error: "Developer key revoked" }, { status: 403 });
    }

    const tokens = await issueTokens({ keyId: key.keyId, requestedScopes });
    await recordMeterEvent({ keyId: key.keyId, scope: "platform.tokens.issue" });
    await touchDeveloperKey(key.keyId);

    return NextResponse.json({
      access_token: tokens.access.accessToken,
      expires_at: tokens.access.expiresAt,
      scopes: tokens.access.scopes,
      refresh_token: tokens.refresh.refreshToken,
      refresh_expires_at: tokens.refresh.expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to issue token";
    return NextResponse.json({ error: message }, { status: resolveTokenIssueStatus(error) });
  }
}

import { NextResponse } from "next/server";
import { refreshAccessToken } from "../../../../../lib/platform/tokens";
import { recordMeterEvent } from "../../../../../lib/platform/meter";
import { touchDeveloperKey } from "../../../../../lib/platform/keys";

export const runtime = "nodejs";

function resolveTokenRefreshStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : "Failed to refresh token";
  if (message.includes("Invalid refresh token")) return 401;
  if (message.includes("expired")) return 401;
  if (message.includes("revoked")) return 403;
  if (message.includes("No active entitlements")) return 403;
  return 400;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const refreshToken = body?.refresh_token as string | undefined;
  if (!refreshToken) {
    return NextResponse.json({ error: "refresh_token is required" }, { status: 400 });
  }

  try {
    const access = await refreshAccessToken({ refreshToken });
    await recordMeterEvent({ keyId: access.keyId, scope: "platform.tokens.refresh" });
    await touchDeveloperKey(access.keyId);
    return NextResponse.json({
      access_token: access.accessToken,
      expires_at: access.expiresAt,
      scopes: access.scopes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refresh token";
    return NextResponse.json({ error: message }, { status: resolveTokenRefreshStatus(error) });
  }
}

import { NextResponse } from "next/server";
import { createDeveloperKey, listDeveloperKeys } from "../../../../lib/platform/keys";
import { getServerUserId } from "../../../../lib/auth/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ownerUserId = await getServerUserId();
  if (!ownerUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await listDeveloperKeys(ownerUserId);
  return NextResponse.json({
    keys: keys.map((key) => ({
      key_id: key.keyId,
      name: key.name,
      status: key.status,
      created_at: key.createdAt,
      revoked_at: key.revokedAt ?? null,
      last_used_at: key.lastUsedAt ?? null,
      token_ttl_minutes: key.tokenTtlMinutes,
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const ownerUserId = await getServerUserId();
  const name = body?.name as string | undefined;

  if (!ownerUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const key = await createDeveloperKey({ ownerUserId, name });
    return NextResponse.json({
      key: {
        key_id: key.keyId,
        key_secret: key.keySecret,
        name: key.name,
        status: key.status,
        created_at: key.createdAt,
        revoked_at: key.revokedAt ?? null,
        last_used_at: key.lastUsedAt ?? null,
        token_ttl_minutes: key.tokenTtlMinutes,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create developer key";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

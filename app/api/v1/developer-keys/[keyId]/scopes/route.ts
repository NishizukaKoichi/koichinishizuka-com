import { NextResponse } from "next/server";
import { assertDeveloperKeyOwner } from "../../../../../../lib/platform/keys";
import { listDeveloperScopes, upsertDeveloperScope, upsertEntitlement } from "../../../../../../lib/platform/scopes";
import { getRequestUserId } from "../../../../../../lib/platform/request";

export const runtime = "nodejs";

function resolveKeyId(request: Request, params: { keyId?: string } = {}): string | null {
  if (params.keyId) {
    return params.keyId;
  }
  const pathname = new URL(request.url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const index = segments.indexOf("developer-keys");
  if (index === -1 || index + 1 >= segments.length) {
    return null;
  }
  return segments[index + 1] ?? null;
}

export async function GET(
  request: Request,
  context: { params: { keyId: string } }
) {
  const userId = getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = resolveKeyId(request, context.params);
  if (!keyId) {
    return NextResponse.json({ error: "keyId is required" }, { status: 400 });
  }

  try {
    await assertDeveloperKeyOwner({ keyId, ownerUserId: userId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Developer key not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }

  const scopes = await listDeveloperScopes(keyId);
  return NextResponse.json({ scopes });
}

export async function POST(
  request: Request,
  context: { params: { keyId: string } }
) {
  const userId = getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = resolveKeyId(request, context.params);
  if (!keyId) {
    return NextResponse.json({ error: "keyId is required" }, { status: 400 });
  }

  const body = await request.json();
  const scope = body?.scope as string | undefined;
  const action = body?.action as "grant" | "revoke" | undefined;
  const conditionType = body?.conditionType as "free" | "metered" | "review" | undefined;
  const conditionRef = body?.conditionRef as string | undefined;

  if (!scope || !action) {
    return NextResponse.json({ error: "scope and action are required" }, { status: 400 });
  }

  try {
    await assertDeveloperKeyOwner({ keyId, ownerUserId: userId });
    await upsertDeveloperScope({ keyId, scope, action, conditionType, conditionRef });
    await upsertEntitlement({
      keyId,
      scope,
      status: action === "grant" ? "active" : "revoked",
    });
    return NextResponse.json({ status: action === "grant" ? "granted" : "revoked" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update scope";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

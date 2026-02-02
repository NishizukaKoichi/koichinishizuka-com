import { NextResponse } from "next/server";
import { listEntitlements, upsertEntitlement } from "../../../../../lib/spell/entitlements";
import { recordAuditEvent } from "../../../../../lib/spell/audit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const spellId = searchParams.get("spell_id") ?? undefined;
  const userIdentifier = searchParams.get("user_identifier") ?? undefined;
  const status = searchParams.get("status") as "active" | "revoked" | null;

  const entitlements = await listEntitlements({
    spellId,
    userIdentifier,
    status: status ?? undefined,
  });
  return NextResponse.json({ entitlements });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const spellId = body?.spell_id as string | undefined;
  const userIdentifier = body?.user_identifier as string | undefined;
  const status = body?.status as "active" | "revoked" | undefined;
  const sourceEventId = body?.source_event_id as string | undefined;

  if (!spellId || !userIdentifier || !status) {
    return NextResponse.json(
      { error: "spell_id, user_identifier, status are required" },
      { status: 400 }
    );
  }

  if (!["active", "revoked"].includes(status)) {
    return NextResponse.json({ error: "status must be active or revoked" }, { status: 400 });
  }

  try {
    const entitlement = await upsertEntitlement({
      spellId,
      userIdentifier,
      status,
      sourceEventId: sourceEventId ?? "manual",
    });

    await recordAuditEvent({
      eventName: status === "active" ? "entitlement_granted" : "entitlement_revoked",
      targetId: spellId,
      metadata: { userIdentifier, source: "manual" },
    });

    return NextResponse.json({ entitlement });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update entitlement";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { revokeDeveloperKey } from "../../../../../../lib/platform/keys";
import { getServerUserId } from "../../../../../../lib/auth/server";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: { keyId: string } }
) {
  const ownerUserId = await getServerUserId();
  const keyId = context.params.keyId;

  if (!ownerUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!keyId) {
    return NextResponse.json(
      { error: "key_id is required" },
      { status: 400 }
    );
  }

  try {
    await revokeDeveloperKey({ ownerUserId, keyId });
    return NextResponse.json({ status: "revoked" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to revoke developer key";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { rotateDeveloperKey } from "../../../../../../lib/platform/keys";
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
    const secret = await rotateDeveloperKey({ ownerUserId, keyId });
    return NextResponse.json({ key_id: secret.keyId, key_secret: secret.keySecret });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to rotate developer key";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

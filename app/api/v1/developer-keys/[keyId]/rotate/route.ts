import { NextResponse } from "next/server";
import { rotateDeveloperKey } from "../../../../../../lib/platform/keys";
import { getRequestUserId } from "../../../../../../lib/platform/request";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: { keyId: string } }
) {
  const body = await request.json().catch(() => ({}));
  const ownerUserId = (body?.owner_user_id as string | undefined) ?? getRequestUserId(request);
  const keyId = context.params.keyId;

  if (!ownerUserId || !keyId) {
    return NextResponse.json(
      { error: "owner_user_id and key_id are required" },
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

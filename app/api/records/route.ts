import { NextResponse } from "next/server";
import { createEpochRecord } from "../../../lib/epoch-records";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const userId = body?.userId as string | undefined;
  const recordType = body?.recordType as string | undefined;
  const payload = body?.payload as Record<string, unknown> | unknown[] | undefined;
  const visibility = body?.visibility as string | undefined;
  const attachments = body?.attachments as
    | { attachmentHash: string; storagePointer: string }[]
    | undefined;

  if (!userId || !recordType || payload === undefined) {
    return NextResponse.json(
      { error: "userId, recordType, and payload are required" },
      { status: 400 }
    );
  }

  try {
    const record = await createEpochRecord({
      userId,
      recordType,
      payload,
      visibility,
      attachments,
    });

    return NextResponse.json({ record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create record";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

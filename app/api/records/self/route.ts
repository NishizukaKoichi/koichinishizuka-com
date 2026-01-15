import { NextResponse } from "next/server";
import { listRecordsForUser } from "../../../../lib/epoch-records";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const records = await listRecordsForUser(userId);
  return NextResponse.json({ records });
}

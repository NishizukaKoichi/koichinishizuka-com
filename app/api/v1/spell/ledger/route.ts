import { NextResponse } from "next/server";
import { listStripeLedger } from "../../../../../lib/spell/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 100;
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 500) : 100;

  const entries = await listStripeLedger({ limit: safeLimit });
  return NextResponse.json({ entries });
}

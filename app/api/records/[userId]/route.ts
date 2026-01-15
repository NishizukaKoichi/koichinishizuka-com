import { NextResponse } from "next/server";
import { getEntitlement } from "../../../../lib/entitlements";
import {
  listVisibleRecordsForUser,
  listRecordsForUser,
} from "../../../../lib/epoch-records";
import {
  getActiveReadGrant,
  getReadGrantById,
  isReadGrantActive,
  type ReadGrant,
} from "../../../../lib/read-access";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const targetUserId = params.userId;
  const { searchParams } = new URL(request.url);
  const viewerId = searchParams.get("viewerId");
  const includeScoutVisible = searchParams.get("scout") === "1";
  const grantId = searchParams.get("grantId");

  if (!viewerId) {
    return NextResponse.json({ error: "viewerId is required" }, { status: 400 });
  }

  if (viewerId === targetUserId) {
    const records = await listRecordsForUser(targetUserId);
    return NextResponse.json({ records });
  }

  const entitlement = await getEntitlement(viewerId);
  if (!entitlement || entitlement.status !== "active") {
    return NextResponse.json({ error: "Read entitlement required" }, { status: 403 });
  }

  let grant: ReadGrant | null = null;
  if (grantId) {
    const candidate = await getReadGrantById(grantId);
    if (candidate && candidate.viewerId === viewerId && candidate.targetUserId === targetUserId) {
      grant = candidate;
    }
  } else {
    grant = await getActiveReadGrant({ viewerId, targetUserId });
  }

  if (!grant || !isReadGrantActive(grant)) {
    return NextResponse.json({ error: "Active read grant required" }, { status: 403 });
  }

  let records = await listVisibleRecordsForUser({
    userId: targetUserId,
    includeScoutVisible,
  });

  if (grant.type === "time_window") {
    const windowStart = grant.windowStart ? Date.parse(grant.windowStart) : NaN;
    const windowEnd = grant.windowEnd ? Date.parse(grant.windowEnd) : NaN;
    if (!Number.isNaN(windowStart) && !Number.isNaN(windowEnd)) {
      records = records.filter((record) => {
        const recordedAt = Date.parse(record.recordedAt);
        return recordedAt >= windowStart && recordedAt <= windowEnd;
      });
    }
  }

  return NextResponse.json({ records });
}

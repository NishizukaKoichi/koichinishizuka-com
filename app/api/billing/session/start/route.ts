import { NextResponse } from "next/server";
import { getEntitlement } from "../../../../../lib/entitlements";
import { audit } from "../../../../../lib/audit";
import { track } from "../../../../../lib/analytics";
import { startReadGrant, type ReadAccessType } from "../../../../../lib/read-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const viewerId = body?.userId as string | undefined;
  const targetUserId = body?.targetUserId as string | undefined;
  const type = body?.type as ReadAccessType | undefined;
  const windowStart = body?.windowStart as string | undefined;
  const windowEnd = body?.windowEnd as string | undefined;
  const durationMinutes = body?.durationMinutes as number | undefined;

  if (!viewerId || !targetUserId || !type) {
    return NextResponse.json(
      { error: "userId, targetUserId, and type are required" },
      { status: 400 }
    );
  }

  if (viewerId === targetUserId) {
    return NextResponse.json(
      { error: "Self reads do not require a read session" },
      { status: 400 }
    );
  }

  const entitlement = await getEntitlement(viewerId);
  if (!entitlement || entitlement.status !== "active") {
    return NextResponse.json({ error: "Active entitlement required" }, { status: 403 });
  }

  if (entitlement.planKey !== type) {
    return NextResponse.json(
      { error: "Entitlement plan does not match read type" },
      { status: 403 }
    );
  }

  try {
    const grant = await startReadGrant({
      viewerId,
      targetUserId,
      type,
      windowStart,
      windowEnd,
      durationMinutes,
    });

    if (type === "time_window") {
      track("time_window_started", { viewerId, targetUserId, grantId: grant.grantId });
      audit("time_window_started", { viewerId, targetUserId, grantId: grant.grantId });
    } else {
      track("read_session_started", { viewerId, targetUserId, grantId: grant.grantId });
      audit("read_session_started", { viewerId, targetUserId, grantId: grant.grantId });
    }

    return NextResponse.json({ grant });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start read session";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

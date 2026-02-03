import { NextResponse } from "next/server";
import { getRequestUserId } from "../../../../../lib/platform/request";
import { query } from "../../../../../lib/db/epoch";

export const runtime = "nodejs";

type BillingRow = {
  grant_id: string;
  grant_type: "time_window" | "read_session";
  target_user_id: string;
  window_start: string | null;
  window_end: string | null;
  starts_at: string | null;
  ends_at: string | null;
  ended_at: string | null;
  created_at: string;
  display_name: string | null;
};

type BillingSession = {
  id: string;
  type: "time_window" | "read_session";
  targetUser: string;
  startedAt: string;
  endedAt?: string;
  status: "active" | "expired" | "completed";
  amount: number;
};

function resolveStatus(row: BillingRow): BillingSession["status"] {
  if (row.ended_at) {
    return "completed";
  }
  const now = Date.now();
  const endAt =
    row.grant_type === "read_session"
      ? row.ends_at
      : row.window_end;
  if (!endAt) {
    return "active";
  }
  return new Date(endAt).getTime() < now ? "expired" : "active";
}

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await query<BillingRow>(
    `SELECT g.grant_id, g.grant_type, g.target_user_id,
            g.window_start, g.window_end,
            g.starts_at, g.ends_at, g.ended_at, g.created_at,
            p.display_name
     FROM read_grants g
     LEFT JOIN epoch_profiles p ON p.user_id = g.target_user_id
     WHERE g.viewer_user_id = $1
     ORDER BY g.created_at DESC
     LIMIT 50`,
    [userId]
  );

  const sessions: BillingSession[] = rows.map((row) => ({
    id: row.grant_id,
    type: row.grant_type,
    targetUser: row.display_name ?? row.target_user_id,
    startedAt:
      row.grant_type === "read_session"
        ? row.starts_at ?? row.created_at
        : row.window_start ?? row.created_at,
    endedAt: row.ended_at ?? row.ends_at ?? row.window_end ?? undefined,
    status: resolveStatus(row),
    amount: 0,
  }));

  return NextResponse.json({ sessions });
}

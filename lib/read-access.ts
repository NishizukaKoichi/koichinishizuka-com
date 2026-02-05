import { query } from "./db/epoch";
import { uuidV7Like } from "./ids";

export type ReadAccessType = "time_window" | "read_session";

export type ReadGrant = {
  grantId: string;
  viewerId: string;
  targetUserId: string;
  type: ReadAccessType;
  createdAt: string;
  windowStart?: string;
  windowEnd?: string;
  startsAt?: string;
  endsAt?: string;
  endedAt?: string;
};

type ReadGrantRow = {
  grant_id: string;
  viewer_user_id: string;
  target_user_id: string;
  grant_type: ReadAccessType;
  window_start: string | null;
  window_end: string | null;
  starts_at: string | null;
  ends_at: string | null;
  ended_at: string | null;
  created_at: string;
};

const READ_SESSION_DURATION_MINUTES = 60;
const TIME_WINDOW_DAYS = 90;

const TIME_WINDOW_MS = TIME_WINDOW_DAYS * 24 * 60 * 60 * 1000;
const SESSION_MS = READ_SESSION_DURATION_MINUTES * 60 * 1000;

function mapReadGrant(row: ReadGrantRow): ReadGrant {
  return {
    grantId: row.grant_id,
    viewerId: row.viewer_user_id,
    targetUserId: row.target_user_id,
    type: row.grant_type,
    createdAt: row.created_at,
    windowStart: row.window_start ?? undefined,
    windowEnd: row.window_end ?? undefined,
    startsAt: row.starts_at ?? undefined,
    endsAt: row.ends_at ?? undefined,
    endedAt: row.ended_at ?? undefined,
  };
}

export function isReadGrantActive(grant: ReadGrant, now: Date = new Date()): boolean {
  if (grant.endedAt) {
    return false;
  }
  if (grant.type === "read_session") {
    if (!grant.endsAt) {
      return false;
    }
    return now.getTime() <= new Date(grant.endsAt).getTime();
  }
  return true;
}

async function ensureNoActiveGrant(viewerId: string, targetUserId: string): Promise<void> {
  const nowIso = new Date().toISOString();
  const rows = await query<ReadGrantRow>(
    `SELECT *
     FROM read_grants
     WHERE viewer_user_id = $1
       AND target_user_id = $2
       AND ended_at IS NULL
       AND (
         (grant_type = 'read_session' AND ends_at > $3)
         OR (grant_type = 'time_window')
       )
     ORDER BY created_at DESC
     LIMIT 1`,
    [viewerId, targetUserId, nowIso]
  );

  if (rows.length > 0) {
    throw new Error("Active read grant already exists");
  }
}

export async function startReadGrant(options: {
  viewerId: string;
  targetUserId: string;
  type: ReadAccessType;
}): Promise<ReadGrant> {
  const { viewerId, targetUserId, type } = options;
  if (!viewerId || !targetUserId) {
    throw new Error("viewerId and targetUserId are required");
  }
  if (type !== "time_window" && type !== "read_session") {
    throw new Error("Invalid read grant type");
  }

  await ensureNoActiveGrant(viewerId, targetUserId);

  const now = new Date();
  const nowIso = now.toISOString();
  const grantId = uuidV7Like();

  let windowStart: string | null = null;
  let windowEnd: string | null = null;
  let startsAt: string | null = null;
  let endsAt: string | null = null;

  if (type === "time_window") {
    windowStart = new Date(now.getTime() - TIME_WINDOW_MS).toISOString();
    windowEnd = nowIso;
  } else {
    startsAt = nowIso;
    endsAt = new Date(now.getTime() + SESSION_MS).toISOString();
  }

  const rows = await query<ReadGrantRow>(
    `INSERT INTO read_grants (
       grant_id,
       viewer_user_id,
       target_user_id,
       grant_type,
       window_start,
       window_end,
       starts_at,
       ends_at,
       created_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      grantId,
      viewerId,
      targetUserId,
      type,
      windowStart,
      windowEnd,
      startsAt,
      endsAt,
      nowIso,
    ]
  );

  if (rows.length === 0) {
    throw new Error("Failed to persist read grant");
  }

  return mapReadGrant(rows[0]);
}

export async function endReadGrant(options: {
  viewerId: string;
  grantId: string;
}): Promise<ReadGrant | null> {
  const nowIso = new Date().toISOString();
  const rows = await query<ReadGrantRow>(
    `UPDATE read_grants
     SET ended_at = $1
     WHERE grant_id = $2
       AND viewer_user_id = $3
       AND ended_at IS NULL
     RETURNING *`,
    [nowIso, options.grantId, options.viewerId]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapReadGrant(rows[0]);
}

export async function getReadGrantById(grantId: string): Promise<ReadGrant | null> {
  const rows = await query<ReadGrantRow>(
    `SELECT * FROM read_grants WHERE grant_id = $1`,
    [grantId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapReadGrant(rows[0]);
}

export async function getActiveReadGrant(options: {
  viewerId: string;
  targetUserId: string;
}): Promise<ReadGrant | null> {
  const rows = await query<ReadGrantRow>(
    `SELECT *
     FROM read_grants
     WHERE viewer_user_id = $1
       AND target_user_id = $2
       AND ended_at IS NULL
     ORDER BY created_at DESC`,
    [options.viewerId, options.targetUserId]
  );

  const active = rows.map(mapReadGrant).filter((grant) => isReadGrantActive(grant));
  if (active.length === 0) {
    return null;
  }

  const session = active.find((grant) => grant.type === "read_session");
  if (session) {
    return session;
  }

  return active[0];
}

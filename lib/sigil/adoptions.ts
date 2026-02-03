import { query } from "../db/sigil";
import { uuidV7Like } from "../ids";

export type AdoptionStatus = "accepted" | "declined";

export type Adoption = {
  adoptionId: string;
  spaceId: string;
  userId: string;
  status: AdoptionStatus;
  decidedAt: string;
  createdAt: string;
};

type AdoptionRow = {
  adoption_id: string;
  space_id: string;
  user_id: string;
  status: AdoptionStatus;
  decided_at: string;
  created_at: string;
};

export async function upsertAdoption(options: {
  spaceId: string;
  userId: string;
  status: AdoptionStatus;
}): Promise<Adoption> {
  const nowIso = new Date().toISOString();

  const rows = await query<AdoptionRow>(
    `INSERT INTO adoptions (
       adoption_id,
       space_id,
       user_id,
       status,
       decided_at,
       created_at
     ) VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (space_id, user_id)
     DO UPDATE SET
       status = EXCLUDED.status,
       decided_at = EXCLUDED.decided_at
     RETURNING adoption_id, space_id, user_id, status, decided_at, created_at`,
    [
      uuidV7Like(),
      options.spaceId,
      options.userId,
      options.status,
      nowIso,
      nowIso,
    ]
  );

  if (rows.length === 0) {
    throw new Error("Failed to record adoption");
  }

  return mapAdoption(rows[0]);
}

export async function listAdoptions(userId: string): Promise<Adoption[]> {
  const rows = await query<AdoptionRow>(
    `SELECT adoption_id, space_id, user_id, status, decided_at, created_at
     FROM adoptions
     WHERE user_id = $1
     ORDER BY decided_at DESC`,
    [userId]
  );
  return rows.map(mapAdoption);
}

export async function countAdoptions(spaceId: string): Promise<{
  accepted: number;
  declined: number;
}> {
  const rows = await query<{ status: AdoptionStatus; count: string }>(
    `SELECT status, COUNT(*)::text as count
     FROM adoptions
     WHERE space_id = $1
     GROUP BY status`,
    [spaceId]
  );

  const result = { accepted: 0, declined: 0 };
  for (const row of rows) {
    if (row.status === "accepted") {
      result.accepted = Number(row.count);
    }
    if (row.status === "declined") {
      result.declined = Number(row.count);
    }
  }
  return result;
}

function mapAdoption(row: AdoptionRow): Adoption {
  return {
    adoptionId: row.adoption_id,
    spaceId: row.space_id,
    userId: row.user_id,
    status: row.status,
    decidedAt: row.decided_at,
    createdAt: row.created_at,
  };
}

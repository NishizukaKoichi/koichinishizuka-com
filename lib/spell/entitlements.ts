import { query } from "../db/spell";
import { uuidV7Like } from "../ids";

export type EntitlementStatus = "active" | "revoked";

export type SpellEntitlement = {
  entitlementId: string;
  spellId: string;
  userIdentifier: string;
  status: EntitlementStatus;
  grantedAt: string;
  revokedAt?: string;
  sourceEventId?: string;
};

type EntitlementRow = {
  entitlement_id: string;
  spell_id: string;
  user_identifier: string;
  status: EntitlementStatus;
  granted_at: string;
  revoked_at: string | null;
  source_event_id: string | null;
};

export async function hasActiveEntitlement(options: {
  spellId: string;
  userIdentifier: string;
}): Promise<boolean> {
  const rows = await query<{ entitlement_id: string }>(
    `SELECT entitlement_id
     FROM entitlements
     WHERE spell_id = $1
       AND user_identifier = $2
       AND status = 'active'
       AND revoked_at IS NULL`,
    [options.spellId, options.userIdentifier]
  );
  return rows.length > 0;
}

export async function listEntitlements(options: {
  spellId?: string;
  userIdentifier?: string;
  status?: EntitlementStatus;
} = {}): Promise<SpellEntitlement[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options.spellId) {
    params.push(options.spellId);
    conditions.push(`spell_id = $${params.length}`);
  }
  if (options.userIdentifier) {
    params.push(options.userIdentifier);
    conditions.push(`user_identifier = $${params.length}`);
  }
  if (options.status) {
    params.push(options.status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query<EntitlementRow>(
    `SELECT entitlement_id, spell_id, user_identifier, status, granted_at, revoked_at, source_event_id
     FROM entitlements
     ${where}
     ORDER BY granted_at DESC`,
    params
  );

  return rows.map(mapEntitlement);
}

export async function upsertEntitlement(options: {
  spellId: string;
  userIdentifier: string;
  status: EntitlementStatus;
  sourceEventId?: string;
}): Promise<SpellEntitlement> {
  const nowIso = new Date().toISOString();
  const revokedAt = options.status === "revoked" ? nowIso : null;

  const rows = await query<EntitlementRow>(
    `INSERT INTO entitlements (
       entitlement_id,
       spell_id,
       user_identifier,
       status,
       granted_at,
       revoked_at,
       source_event_id
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (spell_id, user_identifier)
     DO UPDATE SET
       status = EXCLUDED.status,
       revoked_at = EXCLUDED.revoked_at,
       source_event_id = EXCLUDED.source_event_id
     RETURNING entitlement_id, spell_id, user_identifier, status, granted_at, revoked_at, source_event_id`,
    [
      uuidV7Like(),
      options.spellId,
      options.userIdentifier,
      options.status,
      nowIso,
      revokedAt,
      options.sourceEventId ?? null,
    ]
  );

  if (rows.length === 0) {
    throw new Error("Failed to upsert entitlement");
  }

  return mapEntitlement(rows[0]);
}

function mapEntitlement(row: EntitlementRow): SpellEntitlement {
  return {
    entitlementId: row.entitlement_id,
    spellId: row.spell_id,
    userIdentifier: row.user_identifier,
    status: row.status,
    grantedAt: row.granted_at,
    revokedAt: row.revoked_at ?? undefined,
    sourceEventId: row.source_event_id ?? undefined,
  };
}

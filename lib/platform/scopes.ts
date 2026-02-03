import { query } from "../db/platform";
import { uuidV7Like } from "../ids";

export type ScopeStatus = "granted" | "revoked";
export type ConditionType = "free" | "metered" | "review";

export type DeveloperScope = {
  scope: string;
  status: ScopeStatus;
  grantedAt: string;
  revokedAt?: string;
  conditionType: ConditionType;
  conditionRef?: string;
};

type ScopeRow = {
  scope: string;
  status: ScopeStatus;
  granted_at: string;
  revoked_at: string | null;
  condition_type: ConditionType;
  condition_ref: string | null;
};

export async function listDeveloperScopes(keyId: string): Promise<DeveloperScope[]> {
  const rows = await query<ScopeRow>(
    `SELECT scope, status, granted_at, revoked_at, condition_type, condition_ref
     FROM developer_key_scopes
     WHERE key_id = $1
     ORDER BY granted_at DESC`,
    [keyId]
  );

  return rows.map((row) => ({
    scope: row.scope,
    status: row.status,
    grantedAt: row.granted_at,
    revokedAt: row.revoked_at ?? undefined,
    conditionType: row.condition_type,
    conditionRef: row.condition_ref ?? undefined,
  }));
}

export async function upsertDeveloperScope(options: {
  keyId: string;
  scope: string;
  action: "grant" | "revoke";
  conditionType?: ConditionType;
  conditionRef?: string;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  const status: ScopeStatus = options.action === "grant" ? "granted" : "revoked";
  const revokedAt = options.action === "grant" ? null : nowIso;
  const conditionType = options.conditionType ?? "review";
  const conditionRef = options.conditionRef ?? null;

  await query(
    `INSERT INTO developer_key_scopes (
       key_id,
       scope,
       status,
       granted_at,
       revoked_at,
       condition_type,
       condition_ref
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (key_id, scope)
     DO UPDATE SET
       status = EXCLUDED.status,
       revoked_at = EXCLUDED.revoked_at,
       condition_type = EXCLUDED.condition_type,
       condition_ref = EXCLUDED.condition_ref`,
    [
      options.keyId,
      options.scope,
      status,
      nowIso,
      revokedAt,
      conditionType,
      conditionRef,
    ]
  );
}

export async function upsertEntitlement(options: {
  keyId: string;
  scope: string;
  status: "active" | "revoked";
  reason?: string;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  const revokedAt = options.status === "revoked" ? nowIso : null;

  await query(
    `INSERT INTO entitlements (
       entitlement_id,
       subject_type,
       subject_id,
       scope,
       status,
       granted_at,
       revoked_at,
       reason
     ) VALUES ($1, 'developer_key', $2, $3, $4, $5, $6, $7)
     ON CONFLICT (subject_type, subject_id, scope)
     DO UPDATE SET
       status = EXCLUDED.status,
       revoked_at = EXCLUDED.revoked_at,
       reason = EXCLUDED.reason`,
    [
      uuidV7Like(),
      options.keyId,
      options.scope,
      options.status,
      nowIso,
      revokedAt,
      options.reason ?? null,
    ]
  );
}

export async function listActiveEntitlements(keyId: string): Promise<string[]> {
  const rows = await query<{ scope: string }>(
    `SELECT scope
     FROM entitlements
     WHERE subject_type = 'developer_key'
       AND subject_id = $1
       AND status = 'active'`,
    [keyId]
  );
  return rows.map((row) => row.scope);
}

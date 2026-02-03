import { query } from "../db/spell";
import { uuidV7Like } from "../ids";

export type SpellAuditEvent =
  | "spell_created"
  | "spell_status_updated"
  | "scope_created"
  | "entitlement_granted"
  | "entitlement_revoked"
  | "stripe_event_processed"
  | "reconcile_executed";

export type SpellAuditLog = {
  auditId: string;
  eventName: SpellAuditEvent;
  actorId?: string;
  targetId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type AuditRow = {
  audit_id: string;
  event_name: SpellAuditEvent;
  actor_id: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function recordAuditEvent(options: {
  eventName: SpellAuditEvent;
  actorId?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await query(
    `INSERT INTO audit_logs (
       audit_id,
       event_name,
       actor_id,
       target_id,
       metadata,
       created_at
     ) VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
    [
      uuidV7Like(),
      options.eventName,
      options.actorId ?? null,
      options.targetId ?? null,
      JSON.stringify(options.metadata ?? {}),
      new Date().toISOString(),
    ]
  );
}

export async function listAuditLogs(options: {
  limit?: number;
} = {}): Promise<SpellAuditLog[]> {
  const limit = options.limit ?? 100;
  const rows = await query<AuditRow>(
    `SELECT audit_id, event_name, actor_id, target_id, metadata, created_at
     FROM audit_logs
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );

  return rows.map((row) => ({
    auditId: row.audit_id,
    eventName: row.event_name,
    actorId: row.actor_id ?? undefined,
    targetId: row.target_id ?? undefined,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  }));
}

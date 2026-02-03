import { query } from "../db/epoch";

export type AuditActor = "user" | "operator";

export type AuditEntry = {
  id: string;
  action: string;
  timestamp: string;
  details?: string | null;
  actor: AuditActor;
  operatorId?: string | null;
  operatorReason?: string | null;
};

type AuditRow = {
  audit_id: string;
  event_name: string;
  actor_user_id: string | null;
  target_user_id: string | null;
  metadata: unknown;
  created_at: string;
};

function parseMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata) {
    return {};
  }
  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
    } catch (_) {
      return {};
    }
  }
  if (typeof metadata === "object") {
    return metadata as Record<string, unknown>;
  }
  return {};
}

export async function listAuditLogs(options: {
  userId: string;
  filter?: AuditActor | "all";
}): Promise<AuditEntry[]> {
  const rows = await query<AuditRow>(
    `SELECT audit_id, event_name, actor_user_id, target_user_id, metadata, created_at
     FROM audit_logs
     WHERE actor_user_id = $1 OR target_user_id = $1
     ORDER BY created_at DESC
     LIMIT 200`,
    [options.userId]
  );

  return rows
    .map((row) => {
      const metadata = parseMetadata(row.metadata);
      const actor: AuditActor = row.actor_user_id ? "user" : "operator";
      return {
        id: row.audit_id,
        action: row.event_name,
        timestamp: row.created_at,
        details: typeof metadata.details === "string" ? metadata.details : null,
        actor,
        operatorId: typeof metadata.operator_id === "string" ? metadata.operator_id : null,
        operatorReason:
          typeof metadata.operator_reason === "string" ? metadata.operator_reason : null,
      };
    })
    .filter((entry) => {
      if (!options.filter || options.filter === "all") {
        return true;
      }
      return entry.actor === options.filter;
    });
}

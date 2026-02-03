import { query } from "../db/talisman";
import { uuidV7Like } from "../ids";

export type TalismanEventType =
  | "person_created"
  | "credential_added"
  | "credential_revoked";

export type TalismanEvent = {
  eventId: string;
  personId: string;
  eventType: TalismanEventType;
  payload: Record<string, unknown>;
  actor: string;
  recordedAt: string;
};

type EventRow = {
  event_id: string;
  person_id: string;
  event_type: TalismanEventType;
  payload: Record<string, unknown>;
  actor: string;
  recorded_at: string;
};

export async function recordEvent(options: {
  personId: string;
  eventType: TalismanEventType;
  payload?: Record<string, unknown>;
  actor?: string;
}): Promise<void> {
  await query(
    `INSERT INTO events (
       event_id,
       person_id,
       event_type,
       payload,
       actor,
       recorded_at
     ) VALUES ($1, $2, $3, $4::jsonb, $5, $6)`,
    [
      uuidV7Like(),
      options.personId,
      options.eventType,
      JSON.stringify(options.payload ?? {}),
      options.actor ?? "system",
      new Date().toISOString(),
    ]
  );
}

export async function listEvents(options: {
  personId?: string;
  limit?: number;
} = {}): Promise<TalismanEvent[]> {
  const params: unknown[] = [];
  const conditions: string[] = [];
  if (options.personId) {
    params.push(options.personId);
    conditions.push(`person_id = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = options.limit ?? 100;
  params.push(limit);

  const rows = await query<EventRow>(
    `SELECT event_id, person_id, event_type, payload, actor, recorded_at
     FROM events
     ${where}
     ORDER BY recorded_at DESC
     LIMIT $${params.length}`,
    params
  );

  return rows.map((row) => ({
    eventId: row.event_id,
    personId: row.person_id,
    eventType: row.event_type,
    payload: row.payload ?? {},
    actor: row.actor,
    recordedAt: row.recorded_at,
  }));
}

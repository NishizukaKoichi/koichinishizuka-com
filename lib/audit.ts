import { query } from "./db/epoch";
import { uuidV7Like } from "./ids";

export type AuditEventName =
  | "record_created"
  | "visibility_changed"
  | "profile_updated"
  | "scout_sent"
  | "scout_accepted"
  | "scout_declined"
  | "scout_withdrawn"
  | "scout_completed"
  | "scout_message_sent"
  | "scout_message_received"
  | "scout_settings_updated"
  | "silence_settings_updated"
  | "time_window_started"
  | "time_window_ended"
  | "read_session_started"
  | "read_session_ended"
  | "org_created"
  | "org_updated"
  | "org_deleted"
  | "org_invite_sent"
  | "org_department_created"
  | "org_department_updated"
  | "org_department_deleted";

export type AuditProps = Record<string, unknown>;

function extractActorUserId(props: AuditProps): string | null {
  const actorUserId = props.actorUserId;
  if (typeof actorUserId === "string" && actorUserId.length > 0) {
    return actorUserId;
  }
  const viewerId = props.viewerId;
  if (typeof viewerId === "string" && viewerId.length > 0) {
    return viewerId;
  }
  return null;
}

function extractTargetUserId(props: AuditProps): string | null {
  const targetUserId = props.targetUserId;
  if (typeof targetUserId === "string" && targetUserId.length > 0) {
    return targetUserId;
  }
  return null;
}

function stripAuditIdentifiers(props: AuditProps): Record<string, unknown> {
  const { actorUserId, viewerId, targetUserId, ...metadata } = props as Record<
    string,
    unknown
  >;
  return metadata;
}

export async function audit(
  eventName: AuditEventName,
  props: AuditProps = {}
): Promise<void> {
  const actorUserId = extractActorUserId(props);
  const targetUserId = extractTargetUserId(props);
  const metadata = stripAuditIdentifiers(props);
  const metadataJson = JSON.stringify(metadata);

  await query(
    `INSERT INTO audit_logs (
       audit_id,
       event_name,
       actor_user_id,
       target_user_id,
       metadata,
       created_at
     ) VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
    [
      uuidV7Like(),
      eventName,
      actorUserId,
      targetUserId,
      metadataJson,
      new Date().toISOString(),
    ]
  );
}

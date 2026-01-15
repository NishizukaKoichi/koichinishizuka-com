export type AuditEventName =
  | "time_window_started"
  | "time_window_ended"
  | "read_session_started"
  | "read_session_ended";

export type AuditProps = Record<string, unknown>;

export function audit(eventName: AuditEventName, props: AuditProps = {}): void {
  // Replace with an append-only audit log sink in overlay.
  console.log("[audit]", eventName, props);
}

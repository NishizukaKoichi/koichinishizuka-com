import { query } from "../db/platform";
import { uuidV7Like } from "../ids";

export type MeterStatus = "counted" | "ignored";

export async function recordMeterEvent(options: {
  keyId: string;
  scope: string;
  requestId?: string;
  status?: MeterStatus;
}): Promise<void> {
  const requestId = options.requestId ?? uuidV7Like();
  const status = options.status ?? "counted";

  await query(
    `INSERT INTO meter_events (
       event_id,
       key_id,
       scope,
       request_id,
       counted_at,
       status
     ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      uuidV7Like(),
      options.keyId,
      options.scope,
      requestId,
      new Date().toISOString(),
      status,
    ]
  );
}

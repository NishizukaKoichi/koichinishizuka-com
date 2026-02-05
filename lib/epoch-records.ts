import crypto from "node:crypto";
import { query, transaction } from "./db/epoch";
import { uuidV7Like } from "./ids";

export type Visibility = "private" | "scout_visible" | "public";

export type RecordType =
  | "decision_made"
  | "decision_not_made"
  | "invited"
  | "declined"
  | "revised"
  | "period_of_silence"
  | "auth_recovered"
  | "visibility_changed";

export type AttachmentInput = {
  attachmentHash: string;
  storagePointer: string;
};

export type EpochRecord = {
  recordId: string;
  userId: string;
  recordedAt: string;
  recordType: RecordType;
  payload: Record<string, unknown> | unknown[];
  prevHash: string | null;
  recordHash: string;
  visibility: Visibility;
  attachments: AttachmentInput[];
};

type EpochRecordInput = {
  userId: string;
  recordType: RecordType;
  payload: Record<string, unknown> | unknown[];
  visibility?: Visibility;
  attachments?: AttachmentInput[];
};

type EpochRecordRow = {
  record_id: string;
  user_id: string;
  recorded_at: string;
  record_type: RecordType;
  payload: unknown;
  prev_hash: string | null;
  record_hash: string;
  visibility: Visibility;
};

type EpochAttachmentRow = {
  record_id: string;
  attachment_hash: string;
  storage_pointer: string;
};

const allowedRecordTypes = new Set<RecordType>([
  "decision_made",
  "decision_not_made",
  "invited",
  "declined",
  "revised",
  "period_of_silence",
  "auth_recovered",
  "visibility_changed",
]);

function assertRecordType(recordType: string): asserts recordType is RecordType {
  if (!allowedRecordTypes.has(recordType as RecordType)) {
    throw new Error("Invalid record_type");
  }
}

function normalizeVisibility(value?: string | null): Visibility {
  if (value === "private" || value === "scout_visible" || value === "public") {
    return value;
  }
  return "private";
}

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    const body = entries
      .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
}

function hashString(payload: string): string {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function computeRecordHash(params: {
  recordId: string;
  userId: string;
  recordedAt: string;
  recordType: RecordType;
  payload: Record<string, unknown> | unknown[];
  prevHash: string | null;
  attachments: AttachmentInput[];
}): string {
  const attachmentsHash = params.attachments
    .map((attachment) => attachment.attachmentHash)
    .join("|");
  const payloadString = stableStringify(params.payload);
  const base = [
    params.recordId,
    params.userId,
    params.recordedAt,
    params.recordType,
    payloadString,
    params.prevHash ?? "",
    attachmentsHash,
  ].join("|");
  return hashString(base);
}

function validateAttachments(attachments: AttachmentInput[]): void {
  for (const attachment of attachments) {
    if (!attachment.attachmentHash || !attachment.storagePointer) {
      throw new Error("attachmentHash and storagePointer are required");
    }
  }
}

function parsePayload(value: unknown): Record<string, unknown> | unknown[] {
  if (value === null || value === undefined) {
    return {};
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object") {
        return parsed as Record<string, unknown> | unknown[];
      }
    } catch (_) {
      return { value };
    }
  }
  if (typeof value === "object") {
    return value as Record<string, unknown> | unknown[];
  }
  return { value };
}

async function getDbNowIso(): Promise<string> {
  const rows = await query<{ now: string }>("SELECT NOW() as now");
  const dbNow = rows[0]?.now;
  if (dbNow) {
    return new Date(dbNow).toISOString();
  }
  return new Date().toISOString();
}

async function getLatestRecordForUser(userId: string): Promise<{
  recordHash: string;
  recordedAt: string;
} | null> {
  const rows = await query<{ record_hash: string; recorded_at: string }>(
    `SELECT record_hash, recorded_at
     FROM epoch_records
     WHERE user_id = $1
     ORDER BY recorded_at DESC, record_id DESC
     LIMIT 1
     FOR UPDATE`,
    [userId]
  );
  if (rows.length === 0) {
    return null;
  }
  return { recordHash: rows[0].record_hash, recordedAt: rows[0].recorded_at };
}

function ensureMonotonicRecordedAt(nowIso: string, lastIso?: string): string {
  if (!lastIso) {
    return nowIso;
  }
  const now = new Date(nowIso).getTime();
  const last = new Date(lastIso).getTime();
  if (now > last) {
    return nowIso;
  }
  return new Date(last + 1).toISOString();
}

async function persistRecord(record: EpochRecord): Promise<void> {
  await query(
    `INSERT INTO epoch_records (
       record_id,
       user_id,
       recorded_at,
       record_type,
       payload,
       prev_hash,
       record_hash,
       visibility
     ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)`,
    [
      record.recordId,
      record.userId,
      record.recordedAt,
      record.recordType,
      JSON.stringify(record.payload),
      record.prevHash,
      record.recordHash,
      record.visibility,
    ]
  );
}

async function persistAttachments(record: EpochRecord): Promise<void> {
  if (record.attachments.length === 0) {
    return;
  }

  const values: unknown[] = [];
  const placeholders = record.attachments.map((attachment, index) => {
    const base = index * 4;
    values.push(
      uuidV7Like(),
      record.recordId,
      attachment.attachmentHash,
      attachment.storagePointer
    );
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
  });

  await query(
    `INSERT INTO epoch_attachments (
       attachment_id,
       record_id,
       attachment_hash,
       storage_pointer
     ) VALUES ${placeholders.join(", ")}`,
    values
  );
}

function mapRecordRow(
  row: EpochRecordRow,
  attachments: AttachmentInput[]
): EpochRecord {
  return {
    recordId: row.record_id,
    userId: row.user_id,
    recordedAt: row.recorded_at,
    recordType: row.record_type,
    payload: parsePayload(row.payload),
    prevHash: row.prev_hash,
    recordHash: row.record_hash,
    visibility: row.visibility,
    attachments,
  };
}

async function loadAttachmentsMap(recordIds: string[]): Promise<Map<string, AttachmentInput[]>> {
  const map = new Map<string, AttachmentInput[]>();
  if (recordIds.length === 0) {
    return map;
  }

  const placeholders = recordIds.map((_, index) => `$${index + 1}`).join(", ");
  const rows = await query<EpochAttachmentRow>(
    `SELECT record_id, attachment_hash, storage_pointer
     FROM epoch_attachments
     WHERE record_id IN (${placeholders})`,
    recordIds
  );

  for (const row of rows) {
    const list = map.get(row.record_id) ?? [];
    list.push({
      attachmentHash: row.attachment_hash,
      storagePointer: row.storage_pointer,
    });
    map.set(row.record_id, list);
  }

  return map;
}

function buildVisibilityOverrides(records: EpochRecord[]): Map<string, Visibility> {
  const overrides = new Map<string, Visibility>();

  for (const record of records) {
    if (record.recordType !== "visibility_changed") {
      continue;
    }

    const payload = record.payload;
    if (!payload || typeof payload !== "object") {
      continue;
    }

    const targetId = (payload as Record<string, unknown>).target_record_id;
    const visibility = (payload as Record<string, unknown>).visibility;
    if (typeof targetId !== "string" || typeof visibility !== "string") {
      continue;
    }

    const normalized = normalizeVisibility(visibility);
    overrides.set(targetId, normalized);
  }

  return overrides;
}

function applyVisibilityOverrides(
  records: EpochRecord[],
  overrides: Map<string, Visibility>
): EpochRecord[] {
  return records.map((record) => {
    const override = overrides.get(record.recordId);
    if (!override) {
      return record;
    }
    return { ...record, visibility: override };
  });
}

export async function createEpochRecord(input: EpochRecordInput): Promise<EpochRecord> {
  if (!input.userId) {
    throw new Error("userId is required");
  }
  assertRecordType(input.recordType);
  const payload = input.payload;
  if (payload === null || payload === undefined) {
    throw new Error("payload is required");
  }

  const attachments = input.attachments ?? [];
  validateAttachments(attachments);
  const visibility = normalizeVisibility(input.visibility);

  return transaction(async () => {
    const nowIso = await getDbNowIso();
    const latest = await getLatestRecordForUser(input.userId);
    const prevHash = latest?.recordHash ?? null;
    const recordedAt = ensureMonotonicRecordedAt(nowIso, latest?.recordedAt);
    const recordId = uuidV7Like();
    const recordHash = computeRecordHash({
      recordId,
      userId: input.userId,
      recordedAt,
      recordType: input.recordType,
      payload,
      prevHash,
      attachments,
    });

    const record: EpochRecord = {
      recordId,
      userId: input.userId,
      recordedAt,
      recordType: input.recordType,
      payload,
      prevHash,
      recordHash,
      visibility,
      attachments,
    };

    await persistRecord(record);
    await persistAttachments(record);

    return record;
  });
}

export async function createVisibilityChangeRecord(options: {
  userId: string;
  targetRecordId: string;
  visibility: Visibility;
}): Promise<EpochRecord> {
  const rows = await query<{ record_id: string }>(
    `SELECT record_id FROM epoch_records WHERE record_id = $1 AND user_id = $2`,
    [options.targetRecordId, options.userId]
  );

  if (rows.length === 0) {
    throw new Error("Target record not found for user");
  }

  const payload = {
    target_record_id: options.targetRecordId,
    visibility: options.visibility,
  };

  return createEpochRecord({
    userId: options.userId,
    recordType: "visibility_changed",
    payload,
    visibility: "private",
  });
}

export async function listRecordsForUser(userId: string): Promise<EpochRecord[]> {
  const rows = await query<EpochRecordRow>(
    `SELECT record_id, user_id, recorded_at, record_type, payload, prev_hash, record_hash, visibility
     FROM epoch_records
     WHERE user_id = $1
     ORDER BY recorded_at ASC, record_id ASC`,
    [userId]
  );

  if (rows.length === 0) {
    return [];
  }

  const recordIds = rows.map((row) => row.record_id);
  const attachmentsMap = await loadAttachmentsMap(recordIds);
  const records = rows.map((row) =>
    mapRecordRow(row, attachmentsMap.get(row.record_id) ?? [])
  );

  const overrides = buildVisibilityOverrides(records);
  return applyVisibilityOverrides(records, overrides);
}

export async function listVisibleRecordsForUser(options: {
  userId: string;
  includeScoutVisible?: boolean;
}): Promise<EpochRecord[]> {
  const records = await listRecordsForUser(options.userId);
  return records.filter((record) => {
    if (record.visibility === "public") {
      return true;
    }
    if (record.visibility === "scout_visible" && options.includeScoutVisible) {
      return true;
    }
    return false;
  });
}

export async function getEpochRecord(recordId: string): Promise<EpochRecord | null> {
  const rows = await query<EpochRecordRow>(
    `SELECT record_id, user_id, recorded_at, record_type, payload, prev_hash, record_hash, visibility
     FROM epoch_records
     WHERE record_id = $1`,
    [recordId]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const attachmentsMap = await loadAttachmentsMap([row.record_id]);
  const record = mapRecordRow(row, attachmentsMap.get(row.record_id) ?? []);

  const visibilityRows = await query<{ visibility: string | null }>(
    `SELECT payload ->> 'visibility' AS visibility
     FROM epoch_records
     WHERE user_id = $1
       AND record_type = 'visibility_changed'
       AND payload ->> 'target_record_id' = $2
     ORDER BY recorded_at DESC, record_id DESC
     LIMIT 1`,
    [record.userId, record.recordId]
  );

  const override = visibilityRows[0]?.visibility;
  if (override) {
    return { ...record, visibility: normalizeVisibility(override) };
  }

  return record;
}

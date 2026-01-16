import crypto from "node:crypto";
import { query, transaction } from "./db";
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

type EpochStore = {
  recordsByUser: Map<string, EpochRecord[]>;
  recordsById: Map<string, EpochRecord>;
  attachmentsByRecord: Map<string, AttachmentInput[]>;
  visibilityOverrides: Map<string, Visibility>;
};

const globalStore = globalThis as unknown as { __epochStore?: EpochStore };

const epochStore: EpochStore =
  globalStore.__epochStore ??
  (globalStore.__epochStore = {
    recordsByUser: new Map<string, EpochRecord[]>(),
    recordsById: new Map<string, EpochRecord>(),
    attachmentsByRecord: new Map<string, AttachmentInput[]>(),
    visibilityOverrides: new Map<string, Visibility>(),
  });

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

function buildRecord(input: EpochRecordInput): EpochRecord {
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

  const recordId = uuidV7Like();
  const recordedAt = new Date().toISOString();
  const records = epochStore.recordsByUser.get(input.userId) ?? [];
  const prevHash = records.length > 0 ? records[records.length - 1].recordHash : null;
  const visibility = normalizeVisibility(input.visibility);

  const recordHash = computeRecordHash({
    recordId,
    userId: input.userId,
    recordedAt,
    recordType: input.recordType,
    payload,
    prevHash,
    attachments,
  });

  return {
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
}

function storeRecord(record: EpochRecord): void {
  const records = epochStore.recordsByUser.get(record.userId) ?? [];
  records.push(record);
  epochStore.recordsByUser.set(record.userId, records);
  epochStore.recordsById.set(record.recordId, record);
  epochStore.attachmentsByRecord.set(record.recordId, record.attachments);
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

async function persistRecordWithAttachments(record: EpochRecord): Promise<void> {
  await transaction(async () => {
    await persistRecord(record);
    await persistAttachments(record);
  });
}

function applyVisibility(record: EpochRecord): EpochRecord {
  const override = epochStore.visibilityOverrides.get(record.recordId);
  if (!override) {
    return record;
  }
  return { ...record, visibility: override };
}

export async function createEpochRecord(input: EpochRecordInput): Promise<EpochRecord> {
  const record = buildRecord(input);
  await persistRecordWithAttachments(record);
  storeRecord(record);
  return record;
}

export async function createVisibilityChangeRecord(options: {
  userId: string;
  targetRecordId: string;
  visibility: Visibility;
}): Promise<EpochRecord> {
  const target = epochStore.recordsById.get(options.targetRecordId);
  if (!target || target.userId !== options.userId) {
    throw new Error("Target record not found for user");
  }

  const payload = {
    target_record_id: options.targetRecordId,
    visibility: options.visibility,
  };

  const record = await createEpochRecord({
    userId: options.userId,
    recordType: "visibility_changed",
    payload,
    visibility: "private",
  });

  epochStore.visibilityOverrides.set(options.targetRecordId, options.visibility);
  return record;
}

export async function listRecordsForUser(userId: string): Promise<EpochRecord[]> {
  const records = epochStore.recordsByUser.get(userId) ?? [];
  return records.map((record) => applyVisibility(record));
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
  const record = epochStore.recordsById.get(recordId);
  return record ? applyVisibility(record) : null;
}

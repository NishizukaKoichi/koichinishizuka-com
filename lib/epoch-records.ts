import crypto from "node:crypto";

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

function uuidV7Like(): string {
  const bytes = crypto.randomBytes(16);
  const now = Date.now();

  bytes[0] = (now >>> 40) & 0xff;
  bytes[1] = (now >>> 32) & 0xff;
  bytes[2] = (now >>> 24) & 0xff;
  bytes[3] = (now >>> 16) & 0xff;
  bytes[4] = (now >>> 8) & 0xff;
  bytes[5] = now & 0xff;

  bytes[6] = (bytes[6] & 0x0f) | 0x70; // Version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`;
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

function applyVisibility(record: EpochRecord): EpochRecord {
  const override = epochStore.visibilityOverrides.get(record.recordId);
  if (!override) {
    return record;
  }
  return { ...record, visibility: override };
}

export async function createEpochRecord(input: EpochRecordInput): Promise<EpochRecord> {
  const record = buildRecord(input);
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

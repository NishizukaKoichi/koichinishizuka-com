import crypto from "node:crypto";

export type ReadAccessType = "time_window" | "read_session";

export type ReadGrant = {
  grantId: string;
  viewerId: string;
  targetUserId: string;
  type: ReadAccessType;
  createdAt: string;
  windowStart?: string;
  windowEnd?: string;
  sessionEnd?: string;
  endedAt?: string;
};

type ReadAccessStore = {
  grantsByViewer: Map<string, ReadGrant[]>;
  grantsById: Map<string, ReadGrant>;
};

const globalStore = globalThis as unknown as { __readAccessStore?: ReadAccessStore };

const readAccessStore: ReadAccessStore =
  globalStore.__readAccessStore ??
  (globalStore.__readAccessStore = {
    grantsByViewer: new Map<string, ReadGrant[]>(),
    grantsById: new Map<string, ReadGrant>(),
  });

function parseIsoDate(value: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid ISO datetime");
  }
  return parsed;
}

function normalizeIso(value: string): string {
  return parseIsoDate(value).toISOString();
}

function ensurePositiveMinutes(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("durationMinutes must be a positive number");
  }
  return Math.ceil(value);
}

export function isReadGrantActive(grant: ReadGrant, now: Date = new Date()): boolean {
  if (grant.endedAt) {
    return false;
  }
  if (grant.type === "read_session") {
    if (!grant.sessionEnd) {
      return false;
    }
    return now.getTime() <= new Date(grant.sessionEnd).getTime();
  }
  return true;
}

export async function startReadGrant(options: {
  viewerId: string;
  targetUserId: string;
  type: ReadAccessType;
  windowStart?: string;
  windowEnd?: string;
  durationMinutes?: number;
}): Promise<ReadGrant> {
  const { viewerId, targetUserId, type } = options;
  if (!viewerId || !targetUserId) {
    throw new Error("viewerId and targetUserId are required");
  }

  const now = new Date();
  const grant: ReadGrant = {
    grantId: crypto.randomUUID(),
    viewerId,
    targetUserId,
    type,
    createdAt: now.toISOString(),
  };

  if (type === "time_window") {
    if (!options.windowStart || !options.windowEnd) {
      throw new Error("windowStart and windowEnd are required");
    }
    const start = parseIsoDate(options.windowStart);
    const end = parseIsoDate(options.windowEnd);
    if (end.getTime() <= start.getTime()) {
      throw new Error("windowEnd must be after windowStart");
    }
    grant.windowStart = normalizeIso(options.windowStart);
    grant.windowEnd = normalizeIso(options.windowEnd);
  }

  if (type === "read_session") {
    const minutes = ensurePositiveMinutes(options.durationMinutes ?? 0);
    const endsAt = new Date(now.getTime() + minutes * 60 * 1000);
    grant.sessionEnd = endsAt.toISOString();
  }

  const grants = readAccessStore.grantsByViewer.get(viewerId) ?? [];
  grants.push(grant);
  readAccessStore.grantsByViewer.set(viewerId, grants);
  readAccessStore.grantsById.set(grant.grantId, grant);

  return grant;
}

export async function endReadGrant(options: {
  viewerId: string;
  grantId: string;
}): Promise<ReadGrant | null> {
  const grant = readAccessStore.grantsById.get(options.grantId);
  if (!grant || grant.viewerId !== options.viewerId) {
    return null;
  }
  if (!grant.endedAt) {
    grant.endedAt = new Date().toISOString();
    readAccessStore.grantsById.set(grant.grantId, grant);
  }
  return grant;
}

export async function getReadGrantById(grantId: string): Promise<ReadGrant | null> {
  return readAccessStore.grantsById.get(grantId) ?? null;
}

export async function getActiveReadGrant(options: {
  viewerId: string;
  targetUserId: string;
}): Promise<ReadGrant | null> {
  const grants = readAccessStore.grantsByViewer.get(options.viewerId) ?? [];
  const candidates = grants.filter(
    (grant) =>
      grant.targetUserId === options.targetUserId && isReadGrantActive(grant)
  );

  if (candidates.length === 0) {
    return null;
  }

  const activeSession = [...candidates]
    .filter((grant) => grant.type === "read_session")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (activeSession) {
    return activeSession;
  }

  return [...candidates].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

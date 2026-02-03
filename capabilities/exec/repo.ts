import { query, transaction } from "@/lib/db/platform";
import { uuidV7Like } from "@/lib/ids";
import {
  intentRecordSchema,
  runRecordSchema,
  type IntentRecord,
  type RunErrorPayload,
  type RunRecord,
  type RunStatus,
} from "./schema";

type TimestampValue = string | Date | null | undefined;

type DbIntentRow = {
  id: string;
  user_id: string;
  action: string;
  args: unknown;
  status: string | null;
  expires_at: TimestampValue;
  created_at: TimestampValue;
};

type DbRunRow = {
  id: string;
  user_id: string;
  intent_id: string;
  idempotency_key: string;
  status: string;
  output: unknown;
  error: unknown;
  started_at: TimestampValue;
  finished_at: TimestampValue;
  created_at: TimestampValue;
};

const RUN_COLUMNS =
  "id, user_id, intent_id, idempotency_key, status, output, error, started_at, finished_at, created_at";
const INTENT_COLUMNS = "id, user_id, action, args, status, expires_at, created_at";

const toIso = (value: TimestampValue) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const normalizeIntent = (row: DbIntentRow): IntentRecord => {
  return intentRecordSchema.parse({
    ...row,
    expires_at: toIso(row.expires_at),
    created_at: toIso(row.created_at),
  }) as IntentRecord;
};

const normalizeRun = (row: DbRunRow): RunRecord => {
  return runRecordSchema.parse({
    ...row,
    started_at: toIso(row.started_at),
    finished_at: toIso(row.finished_at),
    created_at: toIso(row.created_at),
  }) as RunRecord;
};

export async function fetchIntent(userId: string, intentId: string) {
  const rows = await query<DbIntentRow>(
    `select ${INTENT_COLUMNS}
       from intents
      where id = $1 and user_id = $2
      limit 1`,
    [intentId, userId]
  );

  const intent = rows[0];
  if (intent) {
    return { intent: normalizeIntent(intent), error: null };
  }

  if (process.env.NODE_ENV !== "development") {
    return { intent: null, error: null };
  }

  const fallbackRows = await query<DbIntentRow>(
    `select ${INTENT_COLUMNS}
       from intents
      where id = $1
      limit 1`,
    [intentId]
  );

  const fallbackIntent = fallbackRows[0];
  if (!fallbackIntent) {
    return { intent: null, error: null };
  }

  return { intent: normalizeIntent(fallbackIntent), error: null };
}

export async function listIntents(userId: string, limit = 50) {
  const rows = await query<DbIntentRow>(
    `select ${INTENT_COLUMNS}
       from intents
      where user_id = $1
      order by created_at desc
      limit $2`,
    [userId, limit]
  );

  return { intents: rows.map(normalizeIntent), error: null };
}

export async function createIntent(params: {
  id: string;
  userId: string;
  action: string;
  status: string;
  args: unknown;
}) {
  await query<DbIntentRow>(
    `insert into intents (id, user_id, action, args, status)
     values ($1, $2, $3, $4, $5)`,
    [params.id, params.userId, params.action, params.args, params.status]
  );
}

export async function fetchRunById(userId: string, runId: string) {
  const rows = await query<DbRunRow>(
    `select ${RUN_COLUMNS}
       from runs
      where id = $1 and user_id = $2
      limit 1`,
    [runId, userId]
  );

  const run = rows[0];
  if (run) {
    return { run: normalizeRun(run), error: null };
  }

  if (process.env.NODE_ENV !== "development") {
    return { run: null, error: null };
  }

  const fallbackRows = await query<DbRunRow>(
    `select ${RUN_COLUMNS}
       from runs
      where id = $1
      limit 1`,
    [runId]
  );

  const fallbackRun = fallbackRows[0];
  if (!fallbackRun) {
    return { run: null, error: null };
  }

  return { run: normalizeRun(fallbackRun), error: null };
}

export async function listRuns(userId: string, limit = 50) {
  const rows = await query<DbRunRow>(
    `select ${RUN_COLUMNS}
       from runs
      where user_id = $1
      order by created_at desc
      limit $2`,
    [userId, limit]
  );

  return { runs: rows.map(normalizeRun), error: null };
}

export async function findRunByIdempotencyKey(
  userId: string,
  idempotencyKey: string
) {
  const rows = await query<DbRunRow>(
    `select ${RUN_COLUMNS}
       from runs
      where user_id = $1 and idempotency_key = $2
      order by created_at desc
      limit 1`,
    [userId, idempotencyKey]
  );

  const run = rows[0];
  if (!run) {
    return { run: null, error: null };
  }

  return { run: normalizeRun(run), error: null };
}

export async function insertRunningRun(params: {
  userId: string;
  intentId: string;
  idempotencyKey: string;
  startedAt: string;
}) {
  return transaction(async () => {
    const runId = uuidV7Like();
    const rows = await query<DbRunRow>(
      `insert into runs
        (id, user_id, intent_id, idempotency_key, status, started_at)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (user_id, idempotency_key) do nothing
       returning ${RUN_COLUMNS}`,
      [
        runId,
        params.userId,
        params.intentId,
        params.idempotencyKey,
        "running" satisfies RunStatus,
        params.startedAt,
      ]
    );

    if (rows.length === 0) {
      const existing = await findRunByIdempotencyKey(
        params.userId,
        params.idempotencyKey
      );
      return { run: existing.run, conflict: true, error: null };
    }

    return { run: normalizeRun(rows[0]), conflict: false, error: null };
  });
}

export async function markRunSuccess(
  userId: string,
  runId: string,
  finishedAt: string,
  output: unknown
) {
  const rows = await query<DbRunRow>(
    `update runs
        set status = $1,
            output = $2,
            finished_at = $3
      where id = $4 and user_id = $5
      returning ${RUN_COLUMNS}`,
    ["succeeded" satisfies RunStatus, output, finishedAt, runId, userId]
  );

  const run = rows[0];
  if (!run) {
    return { run: null, error: null };
  }

  return { run: normalizeRun(run), error: null };
}

export async function markRunFailure(
  userId: string,
  runId: string,
  finishedAt: string,
  errorPayload: RunErrorPayload
) {
  const rows = await query<DbRunRow>(
    `update runs
        set status = $1,
            error = $2,
            finished_at = $3
      where id = $4 and user_id = $5
      returning ${RUN_COLUMNS}`,
    ["failed" satisfies RunStatus, errorPayload, finishedAt, runId, userId]
  );

  const run = rows[0];
  if (!run) {
    return { run: null, error: null };
  }

  return { run: normalizeRun(run), error: null };
}

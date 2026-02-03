import { AsyncLocalStorage } from "node:async_hooks";
import { Pool } from "pg";

export type DbRow = Record<string, unknown>;

export type DbQueryResult<T extends DbRow> = {
  rows: T[];
};

export type DbClient = {
  query: <T extends DbRow>(sql: string, params?: unknown[]) => Promise<DbQueryResult<T>>;
};

export type DbTarget =
  | "platform"
  | "epoch"
  | "sigil"
  | "pact"
  | "talisman"
  | "spell";

const targetEnv: Record<DbTarget, string> = {
  platform: "PLATFORM_DATABASE_URL",
  epoch: "EPOCH_DATABASE_URL",
  sigil: "SIGIL_DATABASE_URL",
  pact: "PACT_DATABASE_URL",
  talisman: "TALISMAN_DATABASE_URL",
  spell: "SPELL_DATABASE_URL",
};

type ScopedClient = {
  target: DbTarget;
  client: DbClient;
};

const globalStore = globalThis as unknown as {
  __dbClients?: Map<DbTarget, DbClient>;
  __dbPools?: Map<DbTarget, Pool>;
};

const clientStorage = new AsyncLocalStorage<ScopedClient>();

function getClients(): Map<DbTarget, DbClient> {
  if (!globalStore.__dbClients) {
    globalStore.__dbClients = new Map();
  }
  return globalStore.__dbClients;
}

function getPools(): Map<DbTarget, Pool> {
  if (!globalStore.__dbPools) {
    globalStore.__dbPools = new Map();
  }
  return globalStore.__dbPools;
}

function initDbFromEnv(target: DbTarget): void {
  const pools = getPools();
  const clients = getClients();
  if (clients.has(target) || pools.has(target)) {
    return;
  }
  const envKey = targetEnv[target];
  const url = process.env[envKey];
  if (!url) {
    return;
  }
  pools.set(target, new Pool({ connectionString: url }));
}

function getActiveClient(target: DbTarget): DbClient {
  const pools = getPools();
  const clients = getClients();
  const scoped = clientStorage.getStore();
  if (scoped && scoped.target === target) return scoped.client;
  const direct = clients.get(target);
  if (direct) return direct;
  const pool = pools.get(target);
  if (pool) {
    return {
      query: async <T extends DbRow>(sql: string, params: unknown[] = []) => {
        const result = await pool.query<T>(sql, params);
        return { rows: result.rows };
      },
    };
  }
  const envKey = targetEnv[target];
  throw new Error(`DB client not configured for ${target} (${envKey})`);
}

export function setDbClient(target: DbTarget, client: DbClient): void {
  getClients().set(target, client);
}

export function hasDbClient(target: DbTarget): boolean {
  initDbFromEnv(target);
  const pools = getPools();
  const clients = getClients();
  return Boolean(clients.has(target) || pools.has(target));
}

export function getDbClient(target: DbTarget): DbClient {
  initDbFromEnv(target);
  return getActiveClient(target);
}

export async function query<T extends DbRow>(
  target: DbTarget,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  initDbFromEnv(target);
  const client = getActiveClient(target);
  const result = await client.query<T>(sql, params);
  return result.rows;
}

export async function transaction<T>(target: DbTarget, fn: () => Promise<T>): Promise<T> {
  initDbFromEnv(target);
  const pools = getPools();
  const pool = pools.get(target);
  if (pool) {
    const poolClient = await pool.connect();
    const scopedClient: DbClient = {
      query: async <T extends DbRow>(sql: string, params: unknown[] = []) => {
        const result = await poolClient.query<T>(sql, params);
        return { rows: result.rows };
      },
    };
    try {
      return await clientStorage.run({ target, client: scopedClient }, async () => {
        await poolClient.query("BEGIN");
        const result = await fn();
        await poolClient.query("COMMIT");
        return result;
      });
    } catch (error) {
      await poolClient.query("ROLLBACK");
      throw error;
    } finally {
      poolClient.release();
    }
  }

  const client = getActiveClient(target);
  await client.query("BEGIN");
  try {
    const result = await fn();
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

import { AsyncLocalStorage } from "node:async_hooks";
import { Pool } from "pg";

export type DbRow = Record<string, unknown>;

export type DbQueryResult<T extends DbRow> = {
  rows: T[];
};

export type DbClient = {
  query: <T extends DbRow>(sql: string, params?: unknown[]) => Promise<DbQueryResult<T>>;
};

const globalStore = globalThis as unknown as {
  __dbClient?: DbClient;
  __dbPool?: Pool;
};

const clientStorage = new AsyncLocalStorage<DbClient>();

function initDbFromEnv(): void {
  if (globalStore.__dbClient || globalStore.__dbPool) {
    return;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    return;
  }
  globalStore.__dbPool = new Pool({ connectionString: url });
}

function getActiveClient(): DbClient {
  const scoped = clientStorage.getStore();
  if (scoped) return scoped;
  if (globalStore.__dbClient) return globalStore.__dbClient;
  if (globalStore.__dbPool) {
    const pool = globalStore.__dbPool;
    return {
      query: async <T extends DbRow>(sql: string, params: unknown[] = []) => {
        const result = await pool.query<T>(sql, params);
        return { rows: result.rows };
      },
    };
  }
  throw new Error("DB client not configured");
}

export function setDbClient(client: DbClient): void {
  globalStore.__dbClient = client;
}

export function hasDbClient(): boolean {
  initDbFromEnv();
  return Boolean(globalStore.__dbClient || globalStore.__dbPool);
}

export function getDbClient(): DbClient {
  initDbFromEnv();
  return getActiveClient();
}

export async function query<T extends DbRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = getActiveClient();
  const result = await client.query<T>(sql, params);
  return result.rows;
}

export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  initDbFromEnv();
  if (globalStore.__dbPool) {
    const poolClient = await globalStore.__dbPool.connect();
    const scopedClient: DbClient = {
      query: async <T extends DbRow>(sql: string, params: unknown[] = []) => {
        const result = await poolClient.query<T>(sql, params);
        return { rows: result.rows };
      },
    };
    try {
      return await clientStorage.run(scopedClient, async () => {
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

  const client = getActiveClient();
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

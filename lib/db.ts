export type DbRow = Record<string, unknown>;

export type DbQueryResult<T extends DbRow> = {
  rows: T[];
};

export type DbClient = {
  query: <T extends DbRow>(sql: string, params?: unknown[]) => Promise<DbQueryResult<T>>;
};

const globalStore = globalThis as unknown as { __dbClient?: DbClient };

export function getDbClient(): DbClient {
  if (!globalStore.__dbClient) {
    throw new Error("DB client not configured");
  }
  return globalStore.__dbClient;
}

export async function query<T extends DbRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = getDbClient();
  const result = await client.query<T>(sql, params);
  return result.rows;
}

export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  const client = getDbClient();
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

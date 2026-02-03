import type { DbRow } from "../db";
import { hasDbClient as hasDbClientDb, query as queryDb, transaction as transactionDb } from "../db";

export function query<T extends DbRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  return queryDb("pact", sql, params);
}

export function transaction<T>(fn: () => Promise<T>): Promise<T> {
  return transactionDb("pact", fn);
}

export function hasDbClient(): boolean {
  return hasDbClientDb("pact");
}

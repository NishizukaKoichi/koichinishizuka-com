import { query } from "../db/spell";

export type Scope = {
  scopeKey: string;
  description: string;
  createdAt: string;
};

type ScopeRow = {
  scope_key: string;
  description: string;
  created_at: string;
};

export async function createScope(options: {
  scopeKey: string;
  description: string;
}): Promise<Scope> {
  const rows = await query<ScopeRow>(
    `INSERT INTO scopes (
       scope_key,
       description,
       created_at
     ) VALUES ($1, $2, $3)
     RETURNING scope_key, description, created_at`,
    [options.scopeKey, options.description, new Date().toISOString()]
  );
  if (rows.length === 0) {
    throw new Error("Failed to create scope");
  }
  return mapScope(rows[0]);
}

export async function listScopes(): Promise<Scope[]> {
  const rows = await query<ScopeRow>(
    `SELECT scope_key, description, created_at
     FROM scopes
     ORDER BY created_at DESC`
  );
  return rows.map(mapScope);
}

export async function listSpellScopes(spellId: string): Promise<string[]> {
  const rows = await query<{ scope_key: string }>(
    `SELECT scope_key
     FROM spell_scopes
     WHERE spell_id = $1`,
    [spellId]
  );
  return rows.map((row) => row.scope_key);
}

export async function attachScopesToSpell(options: {
  spellId: string;
  scopes: string[];
}): Promise<void> {
  if (options.scopes.length === 0) {
    return;
  }
  await Promise.all(
    options.scopes.map((scopeKey) =>
      query(
        `INSERT INTO spell_scopes (
           spell_id,
           scope_key
         ) VALUES ($1, $2)
         ON CONFLICT (spell_id, scope_key) DO NOTHING`,
        [options.spellId, scopeKey]
      )
    )
  );
}

export async function isScopeAllowedForSpell(options: {
  spellId: string;
  scopeKey: string;
}): Promise<boolean> {
  const rows = await query<{ scope_key: string }>(
    `SELECT scope_key
     FROM spell_scopes
     WHERE spell_id = $1 AND scope_key = $2`,
    [options.spellId, options.scopeKey]
  );
  return rows.length > 0;
}

function mapScope(row: ScopeRow): Scope {
  return {
    scopeKey: row.scope_key,
    description: row.description,
    createdAt: row.created_at,
  };
}

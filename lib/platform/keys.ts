import { query } from "../db/platform";
import { uuidV7Like } from "../ids";
import { ACCESS_TOKEN_TTL_MINUTES } from "./constants";
import { generateOpaqueToken, hashToken } from "./crypto";

export type DeveloperKeyStatus = "active" | "revoked";

export type DeveloperKey = {
  keyId: string;
  name: string;
  status: DeveloperKeyStatus;
  createdAt: string;
  revokedAt?: string;
  lastUsedAt?: string;
  tokenTtlMinutes: number;
};

type DeveloperKeyRow = {
  key_id: string;
  name: string;
  status: DeveloperKeyStatus;
  created_at: string;
  revoked_at: string | null;
  last_used_at: string | null;
};

export type DeveloperKeySecret = {
  keyId: string;
  keySecret: string;
};

export async function createDeveloperKey(options: {
  ownerUserId: string;
  name: string;
}): Promise<DeveloperKey & DeveloperKeySecret> {
  const keyId = uuidV7Like();
  const keySecret = generateOpaqueToken();
  const secretHash = hashToken(keySecret);
  const nowIso = new Date().toISOString();

  const rows = await query<DeveloperKeyRow>(
    `INSERT INTO developer_keys (
       key_id,
       secret_hash,
       owner_user_id,
       name,
       status,
       created_at
     ) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING key_id, name, status, created_at, revoked_at, last_used_at`,
    [keyId, secretHash, options.ownerUserId, options.name, "active", nowIso]
  );

  if (rows.length === 0) {
    throw new Error("Failed to create developer key");
  }

  const row = rows[0];
  return {
    keyId: row.key_id,
    keySecret,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    revokedAt: row.revoked_at ?? undefined,
    lastUsedAt: row.last_used_at ?? undefined,
    tokenTtlMinutes: ACCESS_TOKEN_TTL_MINUTES,
  };
}

export async function listDeveloperKeys(ownerUserId: string): Promise<DeveloperKey[]> {
  const rows = await query<DeveloperKeyRow>(
    `SELECT key_id, name, status, created_at, revoked_at, last_used_at
     FROM developer_keys
     WHERE owner_user_id = $1
     ORDER BY created_at DESC`,
    [ownerUserId]
  );

  return rows.map((row) => ({
    keyId: row.key_id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    revokedAt: row.revoked_at ?? undefined,
    lastUsedAt: row.last_used_at ?? undefined,
    tokenTtlMinutes: ACCESS_TOKEN_TTL_MINUTES,
  }));
}

export async function rotateDeveloperKey(options: {
  ownerUserId: string;
  keyId: string;
}): Promise<DeveloperKeySecret> {
  const keySecret = generateOpaqueToken();
  const secretHash = hashToken(keySecret);

  const rows = await query<{ key_id: string }>(
    `UPDATE developer_keys
     SET secret_hash = $1
     WHERE key_id = $2
       AND owner_user_id = $3
       AND status = 'active'
     RETURNING key_id`,
    [secretHash, options.keyId, options.ownerUserId]
  );

  if (rows.length === 0) {
    throw new Error("Developer key not found or not active");
  }

  return { keyId: rows[0].key_id, keySecret };
}

export async function revokeDeveloperKey(options: {
  ownerUserId: string;
  keyId: string;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  const rows = await query<{ key_id: string }>(
    `UPDATE developer_keys
     SET status = 'revoked',
         revoked_at = $1
     WHERE key_id = $2
       AND owner_user_id = $3
       AND status = 'active'
     RETURNING key_id`,
    [nowIso, options.keyId, options.ownerUserId]
  );

  if (rows.length === 0) {
    throw new Error("Developer key not found or already revoked");
  }
}

export async function getKeyBySecret(keySecret: string): Promise<{
  keyId: string;
  ownerUserId: string;
  status: DeveloperKeyStatus;
}> {
  const secretHash = hashToken(keySecret);
  const rows = await query<{
    key_id: string;
    owner_user_id: string;
    status: DeveloperKeyStatus;
  }>(
    `SELECT key_id, owner_user_id, status
     FROM developer_keys
     WHERE secret_hash = $1
     LIMIT 1`,
    [secretHash]
  );

  if (rows.length === 0) {
    throw new Error("Invalid developer key");
  }

  return {
    keyId: rows[0].key_id,
    ownerUserId: rows[0].owner_user_id,
    status: rows[0].status,
  };
}

export async function touchDeveloperKey(keyId: string): Promise<void> {
  await query(
    `UPDATE developer_keys
     SET last_used_at = $1
     WHERE key_id = $2`,
    [new Date().toISOString(), keyId]
  );
}

export async function assertDeveloperKeyOwner(options: {
  keyId: string;
  ownerUserId: string;
}): Promise<void> {
  const rows = await query<{ key_id: string }>(
    `SELECT key_id
     FROM developer_keys
     WHERE key_id = $1
       AND owner_user_id = $2`,
    [options.keyId, options.ownerUserId]
  );
  if (rows.length === 0) {
    throw new Error("Developer key not found");
  }
}

import { query } from "../db/platform";
import { uuidV7Like } from "../ids";
import { ACCESS_TOKEN_TTL_MINUTES, REFRESH_TOKEN_TTL_DAYS } from "./constants";
import { generateOpaqueToken, hashToken } from "./crypto";
import { listActiveEntitlements, normalizeScopeList } from "./scopes";

export type AccessToken = {
  accessToken: string;
  expiresAt: string;
  scopes: string[];
};

export type RefreshToken = {
  refreshToken: string;
  expiresAt: string;
};

type AccessTokenRow = {
  token_id: string;
  key_id: string;
  issued_at: string;
  expires_at: string;
  revoked_at: string | null;
};

type RefreshTokenRow = {
  token_id: string;
  key_id: string;
  issued_at: string;
  expires_at: string;
  revoked_at: string | null;
};

type DeveloperKeyStateRow = {
  status: "active" | "revoked";
};

function computeExpiryMinutes(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function computeExpiryDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

async function assertActiveDeveloperKey(keyId: string): Promise<void> {
  const rows = await query<DeveloperKeyStateRow>(
    `SELECT status
     FROM developer_keys
     WHERE key_id = $1
     LIMIT 1`,
    [keyId]
  );

  if (rows.length === 0) {
    throw new Error("Developer key not found");
  }
  if (rows[0].status !== "active") {
    throw new Error("Developer key revoked");
  }
}

export async function issueTokens(options: {
  keyId: string;
  requestedScopes?: string[];
}): Promise<{ access: AccessToken; refresh: RefreshToken }> {
  await assertActiveDeveloperKey(options.keyId);

  const allowedScopes = await listActiveEntitlements(options.keyId);
  const requestedScopes = normalizeScopeList(options.requestedScopes);
  const requested = requestedScopes.length > 0 ? requestedScopes : allowedScopes;
  const scopes = requested.filter((scope) => allowedScopes.includes(scope));

  if (scopes.length === 0) {
    throw new Error("No active entitlements for requested scopes");
  }

  const accessToken = generateOpaqueToken();
  const refreshToken = generateOpaqueToken();
  const accessExpiresAt = computeExpiryMinutes(ACCESS_TOKEN_TTL_MINUTES);
  const refreshExpiresAt = computeExpiryDays(REFRESH_TOKEN_TTL_DAYS);

  await query(
    `INSERT INTO access_tokens (
       token_id,
       key_id,
       scopes,
       issued_at,
       expires_at,
       token_hash
     ) VALUES ($1, $2, $3::jsonb, $4, $5, $6)`,
    [
      uuidV7Like(),
      options.keyId,
      JSON.stringify(scopes),
      new Date().toISOString(),
      accessExpiresAt,
      hashToken(accessToken),
    ]
  );

  await query(
    `INSERT INTO refresh_tokens (
       token_id,
       key_id,
       issued_at,
       expires_at,
       token_hash
     ) VALUES ($1, $2, $3, $4, $5)`,
    [
      uuidV7Like(),
      options.keyId,
      new Date().toISOString(),
      refreshExpiresAt,
      hashToken(refreshToken),
    ]
  );

  return {
    access: {
      accessToken,
      expiresAt: accessExpiresAt,
      scopes,
    },
    refresh: {
      refreshToken,
      expiresAt: refreshExpiresAt,
    },
  };
}

export async function refreshAccessToken(options: {
  refreshToken: string;
}): Promise<AccessToken & { keyId: string }> {
  const hash = hashToken(options.refreshToken);
  const rows = await query<RefreshTokenRow>(
    `SELECT token_id, key_id, issued_at, expires_at, revoked_at
     FROM refresh_tokens
     WHERE token_hash = $1
     LIMIT 1`,
    [hash]
  );

  if (rows.length === 0) {
    throw new Error("Invalid refresh token");
  }

  const row = rows[0];
  if (row.revoked_at) {
    throw new Error("Refresh token revoked");
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    throw new Error("Refresh token expired");
  }

  await assertActiveDeveloperKey(row.key_id);

  const allowedScopes = await listActiveEntitlements(row.key_id);
  if (allowedScopes.length === 0) {
    throw new Error("No active entitlements");
  }

  const accessToken = generateOpaqueToken();
  const accessExpiresAt = computeExpiryMinutes(ACCESS_TOKEN_TTL_MINUTES);

  await query(
    `INSERT INTO access_tokens (
       token_id,
       key_id,
       scopes,
       issued_at,
       expires_at,
       token_hash
     ) VALUES ($1, $2, $3::jsonb, $4, $5, $6)`,
    [
      uuidV7Like(),
      row.key_id,
      JSON.stringify(allowedScopes),
      new Date().toISOString(),
      accessExpiresAt,
      hashToken(accessToken),
    ]
  );

  return {
    keyId: row.key_id,
    accessToken,
    expiresAt: accessExpiresAt,
    scopes: allowedScopes,
  };
}

export async function verifyAccessToken(accessToken: string): Promise<{
  keyId: string;
  scopes: string[];
}> {
  const hash = hashToken(accessToken);
  const rows = await query<
    AccessTokenRow & { scopes: string }
  >(
    `SELECT token_id, key_id, scopes, issued_at, expires_at, revoked_at
     FROM access_tokens
     WHERE token_hash = $1
     LIMIT 1`,
    [hash]
  );

  if (rows.length === 0) {
    throw new Error("Invalid access token");
  }

  const row = rows[0];
  if (row.revoked_at) {
    throw new Error("Access token revoked");
  }
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    throw new Error("Access token expired");
  }

  await assertActiveDeveloperKey(row.key_id);

  const scopes = typeof row.scopes === "string" ? (JSON.parse(row.scopes) as string[]) : (row.scopes as unknown as string[]);
  return { keyId: row.key_id, scopes };
}

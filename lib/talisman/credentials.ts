import crypto from "node:crypto";
import { query } from "../db/talisman";
import { uuidV7Like } from "../ids";
import { ensurePerson, createPerson } from "./persons";
import { recordEvent } from "./events";

export type CredentialType =
  | "email_magiclink"
  | "phone_otp"
  | "oauth_google"
  | "oauth_apple"
  | "oauth_microsoft"
  | "oauth_x"
  | "passkey"
  | "payment_card";

export type Credential = {
  credentialId: string;
  personId: string;
  type: CredentialType;
  normalizedHash: string;
  issuer: string;
  issuedAt: string;
  revokedAt?: string;
};

type CredentialRow = {
  credential_id: string;
  person_id: string;
  type: CredentialType;
  normalized_hash: string;
  issuer: string;
  issued_at: string;
  revoked_at: string | null;
};

export async function addCredential(options: {
  personId?: string;
  type: CredentialType;
  rawValue: string;
  issuer: string;
}): Promise<Credential> {
  const normalized = normalizeCredential(options.type, options.rawValue);
  const hash = hashValue(normalized);

  const existing = await query<CredentialRow>(
    `SELECT credential_id, person_id, type, normalized_hash, issuer, issued_at, revoked_at
     FROM credentials
     WHERE type = $1 AND normalized_hash = $2
     LIMIT 1`,
    [options.type, hash]
  );

  if (existing.length > 0) {
    return mapCredential(existing[0]);
  }

  let personId = options.personId;
  if (personId) {
    await ensurePerson(personId);
  } else {
    const created = await createPerson();
    personId = created.personId;
  }

  const rows = await query<CredentialRow>(
    `INSERT INTO credentials (
       credential_id,
       person_id,
       type,
       normalized_hash,
       issuer,
       issued_at
     ) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING credential_id, person_id, type, normalized_hash, issuer, issued_at, revoked_at`,
    [
      uuidV7Like(),
      personId,
      options.type,
      hash,
      options.issuer,
      new Date().toISOString(),
    ]
  );

  if (rows.length === 0) {
    throw new Error("Failed to add credential");
  }

  await recordEvent({
    personId,
    eventType: "credential_added",
    payload: { type: options.type, issuer: options.issuer },
  });

  return mapCredential(rows[0]);
}

export async function revokeCredential(options: {
  credentialId: string;
  actor?: string;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  const rows = await query<CredentialRow>(
    `UPDATE credentials
     SET revoked_at = $1
     WHERE credential_id = $2
       AND revoked_at IS NULL
     RETURNING credential_id, person_id, type, normalized_hash, issuer, issued_at, revoked_at`,
    [nowIso, options.credentialId]
  );

  if (rows.length === 0) {
    throw new Error("Credential not found or already revoked");
  }

  const row = rows[0];
  await recordEvent({
    personId: row.person_id,
    eventType: "credential_revoked",
    payload: { credentialId: row.credential_id, type: row.type },
    actor: options.actor ?? "product",
  });
}

export async function listCredentials(personId?: string): Promise<Credential[]> {
  const rows = await query<CredentialRow>(
    `SELECT credential_id, person_id, type, normalized_hash, issuer, issued_at, revoked_at
     FROM credentials
     ${personId ? "WHERE person_id = $1" : ""}
     ORDER BY issued_at DESC`,
    personId ? [personId] : []
  );
  return rows.map(mapCredential);
}

function normalizeCredential(type: CredentialType, rawValue: string): string {
  const value = rawValue.trim();
  switch (type) {
    case "email_magiclink":
      return value.toLowerCase();
    case "phone_otp": {
      const digits = value.replace(/[^\d+]/g, "");
      if (digits.startsWith("+")) {
        return digits;
      }
      return `+${digits}`;
    }
    case "oauth_google":
    case "oauth_apple":
    case "oauth_microsoft":
    case "oauth_x":
    case "passkey":
    case "payment_card":
      return value;
    default:
      return value;
  }
}

function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function mapCredential(row: CredentialRow): Credential {
  return {
    credentialId: row.credential_id,
    personId: row.person_id,
    type: row.type,
    normalizedHash: row.normalized_hash,
    issuer: row.issuer,
    issuedAt: row.issued_at,
    revokedAt: row.revoked_at ?? undefined,
  };
}

import crypto from "node:crypto";
import { query } from "../db/sigil";
import { uuidV7Like } from "../ids";

export type SigilArtifact = {
  artifactId: string;
  spaceId: string;
  revisionId: string;
  subjectUserId: string;
  signature: string;
  issuedAt: string;
};

type ArtifactRow = {
  artifact_id: string;
  space_id: string;
  revision_id: string;
  subject_user_id: string;
  signature: string;
  issued_at: string;
};

function getSigningSecret(): string {
  const secret = process.env.SIGIL_SIGNING_SECRET;
  if (!secret) {
    throw new Error("SIGIL_SIGNING_SECRET is not set");
  }
  return secret;
}

function signPayload(payload: string): string {
  const secret = getSigningSecret();
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function buildPayload(options: {
  spaceId: string;
  revisionId: string;
  subjectUserId: string;
}): string {
  return `${options.spaceId}.${options.revisionId}.${options.subjectUserId}`;
}

export async function issueArtifact(options: {
  spaceId: string;
  revisionId: string;
  subjectUserId: string;
}): Promise<SigilArtifact> {
  const artifactId = uuidV7Like();
  const issuedAt = new Date().toISOString();
  const payload = buildPayload(options);
  const signature = signPayload(payload);

  const rows = await query<ArtifactRow>(
    `INSERT INTO sigil_artifacts (
       artifact_id,
       space_id,
       revision_id,
       subject_user_id,
       signature,
       issued_at
     ) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING artifact_id, space_id, revision_id, subject_user_id, signature, issued_at`,
    [
      artifactId,
      options.spaceId,
      options.revisionId,
      options.subjectUserId,
      signature,
      issuedAt,
    ]
  );

  if (rows.length === 0) {
    throw new Error("Failed to issue artifact");
  }

  return mapArtifact(rows[0]);
}

export async function getArtifact(artifactId: string): Promise<SigilArtifact | null> {
  const rows = await query<ArtifactRow>(
    `SELECT artifact_id, space_id, revision_id, subject_user_id, signature, issued_at
     FROM sigil_artifacts
     WHERE artifact_id = $1`,
    [artifactId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapArtifact(rows[0]);
}

export function verifySignature(options: {
  spaceId: string;
  revisionId: string;
  subjectUserId: string;
  signature: string;
}): boolean {
  const payload = buildPayload(options);
  const expected = signPayload(payload);
  if (expected.length !== options.signature.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(options.signature)
  );
}

function mapArtifact(row: ArtifactRow): SigilArtifact {
  return {
    artifactId: row.artifact_id,
    spaceId: row.space_id,
    revisionId: row.revision_id,
    subjectUserId: row.subject_user_id,
    signature: row.signature,
    issuedAt: row.issued_at,
  };
}

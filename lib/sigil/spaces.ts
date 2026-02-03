import { query, transaction } from "../db/sigil";
import { uuidV7Like } from "../ids";

export type SpaceStatus = "draft" | "final" | "deprecated";
export type SpaceVisibility = "public" | "unlisted" | "private";

export type Space = {
  spaceId: string;
  ownerUserId: string;
  visibility: SpaceVisibility;
  status: SpaceStatus;
  currentRevisionId: string;
  createdAt: string;
  title: string;
  purpose: string;
};

export type SpaceRevision = {
  revisionId: string;
  spaceId: string;
  title: string;
  purpose: string;
  createdAt: string;
  authorUserId: string;
};

type SpaceRow = {
  space_id: string;
  owner_user_id: string;
  visibility: SpaceVisibility;
  status: SpaceStatus;
  current_revision_id: string;
  created_at: string;
  title: string;
  purpose: string;
};

type RevisionRow = {
  revision_id: string;
  space_id: string;
  title: string;
  purpose: string;
  created_at: string;
  author_user_id: string;
};

export async function createSpace(options: {
  ownerUserId: string;
  title: string;
  purpose: string;
  visibility: SpaceVisibility;
}): Promise<Space> {
  return transaction(async () => {
    const spaceId = uuidV7Like();
    const revisionId = uuidV7Like();
    const nowIso = new Date().toISOString();

    await query(
      `INSERT INTO spaces (
         space_id,
         owner_user_id,
         visibility,
         status,
         current_revision_id,
         created_at
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [spaceId, options.ownerUserId, options.visibility, "draft", revisionId, nowIso]
    );

    await query(
      `INSERT INTO space_revisions (
         revision_id,
         space_id,
         title,
         purpose,
         created_at,
         author_user_id
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [revisionId, spaceId, options.title, options.purpose, nowIso, options.ownerUserId]
    );

    return {
      spaceId,
      ownerUserId: options.ownerUserId,
      visibility: options.visibility,
      status: "draft",
      currentRevisionId: revisionId,
      createdAt: nowIso,
      title: options.title,
      purpose: options.purpose,
    };
  });
}

export async function listSpaces(ownerUserId: string): Promise<Space[]> {
  const rows = await query<SpaceRow>(
    `SELECT s.space_id,
            s.owner_user_id,
            s.visibility,
            s.status,
            s.current_revision_id,
            s.created_at,
            r.title,
            r.purpose
     FROM spaces s
     JOIN space_revisions r ON r.revision_id = s.current_revision_id
     WHERE s.owner_user_id = $1
     ORDER BY s.created_at DESC`,
    [ownerUserId]
  );
  return rows.map(mapSpace);
}

export async function getSpace(spaceId: string, ownerUserId: string): Promise<Space | null> {
  const rows = await query<SpaceRow>(
    `SELECT s.space_id,
            s.owner_user_id,
            s.visibility,
            s.status,
            s.current_revision_id,
            s.created_at,
            r.title,
            r.purpose
     FROM spaces s
     JOIN space_revisions r ON r.revision_id = s.current_revision_id
     WHERE s.space_id = $1
       AND s.owner_user_id = $2`,
    [spaceId, ownerUserId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapSpace(rows[0]);
}

export async function getSpaceById(spaceId: string): Promise<Space | null> {
  const rows = await query<SpaceRow>(
    `SELECT s.space_id,
            s.owner_user_id,
            s.visibility,
            s.status,
            s.current_revision_id,
            s.created_at,
            r.title,
            r.purpose
     FROM spaces s
     JOIN space_revisions r ON r.revision_id = s.current_revision_id
     WHERE s.space_id = $1`,
    [spaceId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapSpace(rows[0]);
}

export async function createSpaceRevision(options: {
  spaceId: string;
  authorUserId: string;
  title: string;
  purpose: string;
}): Promise<SpaceRevision> {
  return transaction(async () => {
    const revisionId = uuidV7Like();
    const nowIso = new Date().toISOString();

    await query(
      `INSERT INTO space_revisions (
         revision_id,
         space_id,
         title,
         purpose,
         created_at,
         author_user_id
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        revisionId,
        options.spaceId,
        options.title,
        options.purpose,
        nowIso,
        options.authorUserId,
      ]
    );

    await query(
      `UPDATE spaces
       SET current_revision_id = $1
       WHERE space_id = $2`,
      [revisionId, options.spaceId]
    );

    return {
      revisionId,
      spaceId: options.spaceId,
      title: options.title,
      purpose: options.purpose,
      createdAt: nowIso,
      authorUserId: options.authorUserId,
    };
  });
}

export async function publishSpace(spaceId: string): Promise<void> {
  const rows = await query<{ space_id: string }>(
    `UPDATE spaces
     SET status = 'final'
     WHERE space_id = $1
       AND status != 'final'
     RETURNING space_id`,
    [spaceId]
  );
  if (rows.length === 0) {
    throw new Error("Space already final or not found");
  }
}

export async function listPublicSpaces(): Promise<Space[]> {
  const rows = await query<SpaceRow>(
    `SELECT s.space_id,
            s.owner_user_id,
            s.visibility,
            s.status,
            s.current_revision_id,
            s.created_at,
            r.title,
            r.purpose
     FROM spaces s
     JOIN space_revisions r ON r.revision_id = s.current_revision_id
     WHERE s.status = 'final'
       AND s.visibility IN ('public', 'unlisted')
     ORDER BY s.created_at DESC`
  );
  return rows.map(mapSpace);
}

export async function getPublicSpace(spaceId: string): Promise<Space | null> {
  const rows = await query<SpaceRow>(
    `SELECT s.space_id,
            s.owner_user_id,
            s.visibility,
            s.status,
            s.current_revision_id,
            s.created_at,
            r.title,
            r.purpose
     FROM spaces s
     JOIN space_revisions r ON r.revision_id = s.current_revision_id
     WHERE s.space_id = $1
       AND s.status = 'final'
       AND s.visibility IN ('public', 'unlisted')`,
    [spaceId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapSpace(rows[0]);
}

function mapSpace(row: SpaceRow): Space {
  return {
    spaceId: row.space_id,
    ownerUserId: row.owner_user_id,
    visibility: row.visibility,
    status: row.status,
    currentRevisionId: row.current_revision_id,
    createdAt: row.created_at,
    title: row.title,
    purpose: row.purpose,
  };
}

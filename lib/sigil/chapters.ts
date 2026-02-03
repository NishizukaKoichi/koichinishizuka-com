import { query, transaction } from "../db/sigil";
import { uuidV7Like } from "../ids";

export type Chapter = {
  chapterId: string;
  spaceId: string;
  orderIndex: number;
  currentRevisionId: string;
  createdAt: string;
  title: string;
  body: string;
};

export type ChapterRevision = {
  revisionId: string;
  chapterId: string;
  title: string;
  body: string;
  createdAt: string;
  authorUserId: string;
};

type ChapterRow = {
  chapter_id: string;
  space_id: string;
  order_index: number;
  current_revision_id: string;
  created_at: string;
  title: string;
  body: string;
};

type ChapterRevisionRow = {
  revision_id: string;
  chapter_id: string;
  title: string;
  body: string;
  created_at: string;
  author_user_id: string;
};

export async function createChapter(options: {
  spaceId: string;
  orderIndex: number;
  title: string;
  body: string;
  authorUserId: string;
}): Promise<Chapter> {
  return transaction(async () => {
    const chapterId = uuidV7Like();
    const revisionId = uuidV7Like();
    const nowIso = new Date().toISOString();

    await query(
      `INSERT INTO chapter_revisions (
         revision_id,
         chapter_id,
         title,
         body,
         created_at,
         author_user_id
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        revisionId,
        chapterId,
        options.title,
        options.body,
        nowIso,
        options.authorUserId,
      ]
    );

    await query(
      `INSERT INTO chapters (
         chapter_id,
         space_id,
         order_index,
         current_revision_id,
         created_at
       ) VALUES ($1, $2, $3, $4, $5)`,
      [chapterId, options.spaceId, options.orderIndex, revisionId, nowIso]
    );

    return {
      chapterId,
      spaceId: options.spaceId,
      orderIndex: options.orderIndex,
      currentRevisionId: revisionId,
      createdAt: nowIso,
      title: options.title,
      body: options.body,
    };
  });
}

export async function getChapter(chapterId: string): Promise<Chapter | null> {
  const rows = await query<ChapterRow>(
    `SELECT c.chapter_id,
            c.space_id,
            c.order_index,
            c.current_revision_id,
            c.created_at,
            r.title,
            r.body
     FROM chapters c
     JOIN chapter_revisions r ON r.revision_id = c.current_revision_id
     WHERE c.chapter_id = $1`,
    [chapterId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapChapter(rows[0]);
}

export async function listChapters(spaceId: string): Promise<Chapter[]> {
  const rows = await query<ChapterRow>(
    `SELECT c.chapter_id,
            c.space_id,
            c.order_index,
            c.current_revision_id,
            c.created_at,
            r.title,
            r.body
     FROM chapters c
     JOIN chapter_revisions r ON r.revision_id = c.current_revision_id
     WHERE c.space_id = $1
     ORDER BY c.order_index ASC`,
    [spaceId]
  );
  return rows.map(mapChapter);
}

export async function createChapterRevision(options: {
  chapterId: string;
  title: string;
  body: string;
  authorUserId: string;
}): Promise<ChapterRevision> {
  return transaction(async () => {
    const revisionId = uuidV7Like();
    const nowIso = new Date().toISOString();

    await query(
      `INSERT INTO chapter_revisions (
         revision_id,
         chapter_id,
         title,
         body,
         created_at,
         author_user_id
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        revisionId,
        options.chapterId,
        options.title,
        options.body,
        nowIso,
        options.authorUserId,
      ]
    );

    await query(
      `UPDATE chapters
       SET current_revision_id = $1
       WHERE chapter_id = $2`,
      [revisionId, options.chapterId]
    );

    return {
      revisionId,
      chapterId: options.chapterId,
      title: options.title,
      body: options.body,
      createdAt: nowIso,
      authorUserId: options.authorUserId,
    };
  });
}

function mapChapter(row: ChapterRow): Chapter {
  return {
    chapterId: row.chapter_id,
    spaceId: row.space_id,
    orderIndex: row.order_index,
    currentRevisionId: row.current_revision_id,
    createdAt: row.created_at,
    title: row.title,
    body: row.body,
  };
}

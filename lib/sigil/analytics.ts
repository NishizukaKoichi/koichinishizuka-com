import { query } from "../db/sigil";
import { countAdoptions } from "./adoptions";

export type SigilAnalytics = {
  spaceId: string;
  chapters: number;
  adoptionsAccepted: number;
  adoptionsDeclined: number;
  latestRevisionId: string | null;
};

export async function getAnalytics(spaceId: string): Promise<SigilAnalytics> {
  const chapterRows = await query<{ count: string }>(
    `SELECT COUNT(*)::text as count
     FROM chapters
     WHERE space_id = $1`,
    [spaceId]
  );
  const chapterCount = chapterRows.length ? Number(chapterRows[0].count) : 0;

  const revisionRows = await query<{ revision_id: string }>(
    `SELECT revision_id
     FROM space_revisions
     WHERE space_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [spaceId]
  );

  const adoptions = await countAdoptions(spaceId);

  return {
    spaceId,
    chapters: chapterCount,
    adoptionsAccepted: adoptions.accepted,
    adoptionsDeclined: adoptions.declined,
    latestRevisionId: revisionRows.length ? revisionRows[0].revision_id : null,
  };
}

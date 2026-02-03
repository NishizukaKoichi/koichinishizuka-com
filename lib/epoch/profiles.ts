import { query, transaction } from "../db/epoch";
import { uuidV7Like } from "../ids";

export type ProfileLinkInput = {
  type: string;
  url: string;
  label?: string;
};

export type ProfileLink = {
  id: string;
  type: string;
  url: string;
  label?: string | null;
};

export type EpochProfile = {
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  profession: string | null;
  region: string | null;
  scoutVisible: boolean;
  directoryVisible: boolean;
  createdAt: string;
  updatedAt: string;
  links: ProfileLink[];
};

export type PublicProfile = {
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  profession: string | null;
  region: string | null;
  scoutVisible: boolean;
  recordCount: number;
  firstRecordAt: string | null;
};

const allowedLinkTypes = new Set([
  "website",
  "github",
  "linkedin",
  "twitter",
  "youtube",
  "instagram",
  "portfolio",
  "blog",
  "other",
]);

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  profession: string | null;
  region: string | null;
  scout_visible: boolean;
  directory_visible: boolean;
  created_at: string;
  updated_at: string;
};

type LinkRow = {
  link_id: string;
  link_type: string;
  url: string;
  label: string | null;
};

type PublicProfileRow = ProfileRow & {
  record_count: string | number | null;
  first_record_at: string | null;
};

function mapProfile(row: ProfileRow, links: ProfileLink[]): EpochProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    profession: row.profession,
    region: row.region,
    scoutVisible: row.scout_visible,
    directoryVisible: row.directory_visible,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    links,
  };
}

function mapLink(row: LinkRow): ProfileLink {
  return {
    id: row.link_id,
    type: row.link_type,
    url: row.url,
    label: row.label,
  };
}

export async function ensureProfile(userId: string): Promise<void> {
  await query(
    `INSERT INTO epoch_profiles (user_id, directory_visible, scout_visible)
     VALUES ($1, true, true)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

export async function getProfile(userId: string): Promise<EpochProfile | null> {
  if (!userId) {
    return null;
  }
  await ensureProfile(userId);
  const rows = await query<ProfileRow>(
    `SELECT user_id, display_name, bio, avatar_url, profession, region,
            scout_visible, directory_visible, created_at, updated_at
     FROM epoch_profiles
     WHERE user_id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    return null;
  }

  const links = await query<LinkRow>(
    `SELECT link_id, link_type, url, label
     FROM epoch_profile_links
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId]
  );

  return mapProfile(rows[0], links.map(mapLink));
}

export async function upsertProfile(options: {
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  profession: string | null;
  region: string | null;
  scoutVisible: boolean;
  links: ProfileLinkInput[];
}): Promise<EpochProfile> {
  const { userId } = options;
  if (!userId) {
    throw new Error("userId is required");
  }

  const links = options.links ?? [];
  for (const link of links) {
    if (!allowedLinkTypes.has(link.type)) {
      throw new Error("Invalid link type");
    }
    if (!link.url) {
      throw new Error("Link url is required");
    }
  }

  await transaction(async () => {
    await query(
      `INSERT INTO epoch_profiles (
         user_id,
         display_name,
         bio,
         avatar_url,
         profession,
         region,
         scout_visible,
         directory_visible,
         updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         bio = EXCLUDED.bio,
         avatar_url = EXCLUDED.avatar_url,
         profession = EXCLUDED.profession,
         region = EXCLUDED.region,
         scout_visible = EXCLUDED.scout_visible,
         updated_at = NOW()`,
      [
        userId,
        options.displayName,
        options.bio,
        options.avatarUrl,
        options.profession,
        options.region,
        options.scoutVisible,
      ]
    );

    await query(`DELETE FROM epoch_profile_links WHERE user_id = $1`, [userId]);

    if (links.length > 0) {
      const values: unknown[] = [];
      const placeholders = links.map((link, index) => {
        const base = index * 5;
        values.push(
          uuidV7Like(),
          userId,
          link.type,
          link.url,
          link.label ?? null
        );
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
      });

      await query(
        `INSERT INTO epoch_profile_links (link_id, user_id, link_type, url, label)
         VALUES ${placeholders.join(", ")}`,
        values
      );
    }
  });

  const profile = await getProfile(userId);
  if (!profile) {
    throw new Error("Failed to load profile");
  }
  return profile;
}

export async function listPublicProfiles(): Promise<PublicProfile[]> {
  const rows = await query<PublicProfileRow>(
    `SELECT p.user_id, p.display_name, p.bio, p.avatar_url, p.profession, p.region,
            p.scout_visible, p.directory_visible, p.created_at, p.updated_at,
            stats.record_count, stats.first_record_at
     FROM epoch_profiles p
     LEFT JOIN (
       SELECT user_id,
              COUNT(record_id) AS record_count,
              MIN(recorded_at) AS first_record_at
       FROM epoch_records
       GROUP BY user_id
     ) stats
       ON stats.user_id = p.user_id
     WHERE p.directory_visible = true
     ORDER BY p.created_at DESC`
  );

  return rows.map((row) => ({
    userId: row.user_id,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    profession: row.profession,
    region: row.region,
    scoutVisible: row.scout_visible,
    recordCount: Number(row.record_count ?? 0),
    firstRecordAt: row.first_record_at ?? null,
  }));
}

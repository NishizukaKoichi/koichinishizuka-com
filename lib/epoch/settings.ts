import { query } from "../db/epoch";
import { ensureProfile } from "./profiles";

export type ScoutSettings = {
  enabled: boolean;
  maxPerMonth: number;
  selectedIndustries: string[];
  minCompanySize: number;
  excludeKeywords: string[];
  requireJobDescription: boolean;
  requireSalaryRange: boolean;
};

export type SilenceSettings = {
  days: number;
  autoGenerate: boolean;
};

type ScoutSettingsRow = {
  enabled: boolean;
  max_per_month: number;
  selected_industries: unknown;
  min_company_size: number;
  exclude_keywords: unknown;
  require_job_description: boolean;
  require_salary_range: boolean;
};

type SilenceSettingsRow = {
  days: number;
  auto_generate: boolean;
};

const defaultScoutSettings: ScoutSettings = {
  enabled: true,
  maxPerMonth: 10,
  selectedIndustries: [],
  minCompanySize: 0,
  excludeKeywords: [],
  requireJobDescription: true,
  requireSalaryRange: false,
};

const defaultSilenceSettings: SilenceSettings = {
  days: 7,
  autoGenerate: true,
};

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

export async function getScoutSettings(userId: string): Promise<ScoutSettings> {
  await ensureProfile(userId);
  const rows = await query<ScoutSettingsRow>(
    `SELECT enabled, max_per_month, selected_industries, min_company_size,
            exclude_keywords, require_job_description, require_salary_range
     FROM epoch_scout_settings
     WHERE user_id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    return defaultScoutSettings;
  }

  const row = rows[0];
  return {
    enabled: row.enabled,
    maxPerMonth: row.max_per_month,
    selectedIndustries: parseJsonArray(row.selected_industries),
    minCompanySize: row.min_company_size,
    excludeKeywords: parseJsonArray(row.exclude_keywords),
    requireJobDescription: row.require_job_description,
    requireSalaryRange: row.require_salary_range,
  };
}

export async function saveScoutSettings(userId: string, settings: ScoutSettings): Promise<ScoutSettings> {
  await ensureProfile(userId);
  await query(
    `INSERT INTO epoch_scout_settings (
       user_id,
       enabled,
       max_per_month,
       selected_industries,
       min_company_size,
       exclude_keywords,
       require_job_description,
       require_salary_range,
       updated_at
     ) VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb, $7, $8, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       enabled = EXCLUDED.enabled,
       max_per_month = EXCLUDED.max_per_month,
       selected_industries = EXCLUDED.selected_industries,
       min_company_size = EXCLUDED.min_company_size,
       exclude_keywords = EXCLUDED.exclude_keywords,
       require_job_description = EXCLUDED.require_job_description,
       require_salary_range = EXCLUDED.require_salary_range,
       updated_at = NOW()`,
    [
      userId,
      settings.enabled,
      settings.maxPerMonth,
      JSON.stringify(settings.selectedIndustries),
      settings.minCompanySize,
      JSON.stringify(settings.excludeKeywords),
      settings.requireJobDescription,
      settings.requireSalaryRange,
    ]
  );

  return getScoutSettings(userId);
}

export async function getSilenceSettings(userId: string): Promise<SilenceSettings> {
  await ensureProfile(userId);
  const rows = await query<SilenceSettingsRow>(
    `SELECT days, auto_generate
     FROM epoch_silence_settings
     WHERE user_id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    return defaultSilenceSettings;
  }

  return {
    days: rows[0].days,
    autoGenerate: rows[0].auto_generate,
  };
}

export async function saveSilenceSettings(userId: string, settings: SilenceSettings): Promise<SilenceSettings> {
  await ensureProfile(userId);
  await query(
    `INSERT INTO epoch_silence_settings (
       user_id,
       days,
       auto_generate,
       updated_at
     ) VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       days = EXCLUDED.days,
       auto_generate = EXCLUDED.auto_generate,
       updated_at = NOW()`,
    [userId, settings.days, settings.autoGenerate]
  );

  return getSilenceSettings(userId);
}

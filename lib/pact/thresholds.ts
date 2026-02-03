import { query } from "../db/pact";
import { uuidV7Like } from "../ids";
import { ensureRole } from "./roles";

export type Threshold = {
  thresholdId: string;
  roleId: string;
  periodDays: number;
  minThreshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  growthThreshold: number;
  effectiveAt: string;
  endedAt?: string;
  createdAt: string;
};

type ThresholdRow = {
  threshold_id: string;
  role_id: string;
  period_days: number;
  min_threshold: number;
  warning_threshold: number;
  critical_threshold: number;
  growth_threshold: number;
  effective_at: string;
  ended_at: string | null;
  created_at: string;
};

export async function createThreshold(options: {
  roleId: string;
  periodDays: number;
  minThreshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  growthThreshold: number;
}): Promise<Threshold> {
  await ensureRole(options.roleId);
  const nowIso = new Date().toISOString();
  await query(
    `UPDATE thresholds
     SET ended_at = $1
     WHERE role_id = $2
       AND ended_at IS NULL`,
    [nowIso, options.roleId]
  );

  const rows = await query<ThresholdRow>(
    `INSERT INTO thresholds (
       threshold_id,
       role_id,
       period_days,
       min_threshold,
       warning_threshold,
       critical_threshold,
       growth_threshold,
       effective_at,
       created_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING threshold_id, role_id, period_days, min_threshold, warning_threshold,
              critical_threshold, growth_threshold, effective_at, ended_at, created_at`,
    [
      uuidV7Like(),
      options.roleId,
      options.periodDays,
      options.minThreshold,
      options.warningThreshold,
      options.criticalThreshold,
      options.growthThreshold,
      nowIso,
      nowIso,
    ]
  );

  if (rows.length === 0) {
    throw new Error("Failed to create threshold");
  }

  return mapThreshold(rows[0]);
}

export async function listThresholds(): Promise<Threshold[]> {
  const rows = await query<ThresholdRow>(
    `SELECT threshold_id, role_id, period_days, min_threshold, warning_threshold,
            critical_threshold, growth_threshold, effective_at, ended_at, created_at
     FROM thresholds
     ORDER BY created_at DESC`
  );
  return rows.map(mapThreshold);
}

export async function listThresholdsForRole(roleId: string): Promise<Threshold[]> {
  const rows = await query<ThresholdRow>(
    `SELECT threshold_id, role_id, period_days, min_threshold, warning_threshold,
            critical_threshold, growth_threshold, effective_at, ended_at, created_at
     FROM thresholds
     WHERE role_id = $1
     ORDER BY effective_at DESC`,
    [roleId]
  );
  return rows.map(mapThreshold);
}

export async function getActiveThreshold(roleId: string): Promise<Threshold | null> {
  const rows = await query<ThresholdRow>(
    `SELECT threshold_id, role_id, period_days, min_threshold, warning_threshold,
            critical_threshold, growth_threshold, effective_at, ended_at, created_at
     FROM thresholds
     WHERE role_id = $1
       AND ended_at IS NULL
     ORDER BY effective_at DESC
     LIMIT 1`,
    [roleId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapThreshold(rows[0]);
}

function mapThreshold(row: ThresholdRow): Threshold {
  return {
    thresholdId: row.threshold_id,
    roleId: row.role_id,
    periodDays: row.period_days,
    minThreshold: row.min_threshold,
    warningThreshold: row.warning_threshold,
    criticalThreshold: row.critical_threshold,
    growthThreshold: row.growth_threshold,
    effectiveAt: row.effective_at,
    endedAt: row.ended_at ?? undefined,
    createdAt: row.created_at,
  };
}

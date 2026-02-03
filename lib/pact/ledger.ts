import { query, transaction } from "../db/pact";
import { uuidV7Like } from "../ids";
import { getActiveThreshold } from "./thresholds";
import { createTransition, getLatestTransition, type PactState } from "./transitions";
import { markEmployeeExit } from "./employees";

export type LedgerEntry = {
  entryId: string;
  employeeId: string;
  metricKey: string;
  metricValue: number;
  metricUnit?: string;
  periodStart: string;
  periodEnd: string;
  recordedAt: string;
  source: "system" | "import" | "api";
};

type LedgerRow = {
  entry_id: string;
  employee_id: string;
  metric_key: string;
  metric_value: number;
  metric_unit: string | null;
  period_start: string;
  period_end: string;
  recorded_at: string;
  source: "system" | "import" | "api";
};

export async function createLedgerEntry(options: {
  employeeId: string;
  metricKey: string;
  metricValue: number;
  metricUnit?: string;
  periodStart: string;
  periodEnd: string;
  source?: "system" | "import" | "api";
}): Promise<LedgerEntry> {
  return transaction(async () => {
    const nowIso = new Date().toISOString();
    const source = options.source ?? "api";

    const rows = await query<LedgerRow>(
      `INSERT INTO ledger_entries (
         entry_id,
         employee_id,
         metric_key,
         metric_value,
         metric_unit,
         period_start,
         period_end,
         recorded_at,
         source
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING entry_id, employee_id, metric_key, metric_value, metric_unit,
                 period_start, period_end, recorded_at, source`,
      [
        uuidV7Like(),
        options.employeeId,
        options.metricKey,
        options.metricValue,
        options.metricUnit ?? null,
        options.periodStart,
        options.periodEnd,
        nowIso,
        source,
      ]
    );

    if (rows.length === 0) {
      throw new Error("Failed to insert ledger entry");
    }

    const threshold = await getActiveThresholdForEmployee(options.employeeId);
    const toState = resolveState(options.metricValue, threshold);
    const latest = await getLatestTransition(options.employeeId);
    const fromState = latest?.toState ?? "stable";

    await createTransition({
      employeeId: options.employeeId,
      fromState,
      toState,
      windowStart: options.periodStart,
      windowEnd: options.periodEnd,
      ruleRef: threshold.thresholdId,
    });

    if (toState === "exit") {
      await markEmployeeExit(options.employeeId);
    }

    return mapLedger(rows[0]);
  });
}

export async function listLedger(employeeId?: string): Promise<LedgerEntry[]> {
  const rows = await query<LedgerRow>(
    `SELECT entry_id, employee_id, metric_key, metric_value, metric_unit,
            period_start, period_end, recorded_at, source
     FROM ledger_entries
     ${employeeId ? "WHERE employee_id = $1" : ""}
     ORDER BY recorded_at DESC`,
    employeeId ? [employeeId] : []
  );
  return rows.map(mapLedger);
}

async function getActiveThresholdForEmployee(employeeId: string) {
  const rows = await query<{ role_id: string }>(
    `SELECT role_id
     FROM employees
     WHERE employee_id = $1`,
    [employeeId]
  );
  if (rows.length === 0) {
    throw new Error("Employee not found");
  }
  const threshold = await getActiveThreshold(rows[0].role_id);
  if (!threshold) {
    throw new Error("Threshold not configured");
  }
  return threshold;
}

function resolveState(metricValue: number, threshold: {
  minThreshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  growthThreshold: number;
}): PactState {
  if (metricValue >= threshold.growthThreshold) {
    return "growth";
  }
  if (metricValue >= threshold.minThreshold) {
    return "stable";
  }
  if (metricValue >= threshold.warningThreshold) {
    return "warning";
  }
  if (metricValue >= threshold.criticalThreshold) {
    return "critical";
  }
  return "exit";
}

function mapLedger(row: LedgerRow): LedgerEntry {
  return {
    entryId: row.entry_id,
    employeeId: row.employee_id,
    metricKey: row.metric_key,
    metricValue: row.metric_value,
    metricUnit: row.metric_unit ?? undefined,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    recordedAt: row.recorded_at,
    source: row.source,
  };
}

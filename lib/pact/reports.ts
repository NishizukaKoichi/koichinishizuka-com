import { query } from "../db/pact";
import { uuidV7Like } from "../ids";
import { getEmployee } from "./employees";
import { listLedger } from "./ledger";
import { getLatestTransition } from "./transitions";

export type PactReport = {
  reportId: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  content: Record<string, unknown>;
  createdAt: string;
  deliveredAt?: string;
};

type ReportRow = {
  report_id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  content_json: Record<string, unknown>;
  created_at: string;
  delivered_at: string | null;
};

export async function generateReport(options: {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
}): Promise<PactReport> {
  const employee = await getEmployee(options.employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }

  const ledger = await listLedger(options.employeeId);
  const periodLedger = ledger.filter((entry) =>
    entry.periodStart >= options.periodStart && entry.periodEnd <= options.periodEnd
  );

  const average =
    periodLedger.length === 0
      ? null
      : periodLedger.reduce((sum, entry) => sum + entry.metricValue, 0) / periodLedger.length;

  const transition = await getLatestTransition(options.employeeId);

  const content = {
    employeeId: employee.employeeId,
    displayName: employee.displayName,
    roleId: employee.roleId,
    status: employee.status,
    periodStart: options.periodStart,
    periodEnd: options.periodEnd,
    entries: periodLedger.length,
    averageMetricValue: average,
    latestState: transition?.toState ?? "stable",
    generatedAt: new Date().toISOString(),
  };

  const rows = await query<ReportRow>(
    `INSERT INTO pact_reports (
       report_id,
       employee_id,
       period_start,
       period_end,
       content_json,
       created_at
     ) VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     RETURNING report_id, employee_id, period_start, period_end, content_json, created_at, delivered_at`,
    [
      uuidV7Like(),
      options.employeeId,
      options.periodStart,
      options.periodEnd,
      JSON.stringify(content),
      new Date().toISOString(),
    ]
  );

  if (rows.length === 0) {
    throw new Error("Failed to create report");
  }

  return mapReport(rows[0]);
}

export async function listReports(): Promise<PactReport[]> {
  const rows = await query<ReportRow>(
    `SELECT report_id, employee_id, period_start, period_end, content_json, created_at, delivered_at
     FROM pact_reports
     ORDER BY created_at DESC`
  );
  return rows.map(mapReport);
}

export async function getReport(reportId: string): Promise<PactReport | null> {
  const rows = await query<ReportRow>(
    `SELECT report_id, employee_id, period_start, period_end, content_json, created_at, delivered_at
     FROM pact_reports
     WHERE report_id = $1`,
    [reportId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapReport(rows[0]);
}

function mapReport(row: ReportRow): PactReport {
  return {
    reportId: row.report_id,
    employeeId: row.employee_id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    content: row.content_json ?? {},
    createdAt: row.created_at,
    deliveredAt: row.delivered_at ?? undefined,
  };
}

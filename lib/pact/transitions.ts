import { query } from "../db/pact";
import { uuidV7Like } from "../ids";

export type PactState = "growth" | "stable" | "warning" | "critical" | "exit";

export type Transition = {
  transitionId: string;
  employeeId: string;
  fromState: PactState;
  toState: PactState;
  windowStart: string;
  windowEnd: string;
  triggeredAt: string;
  ruleRef: string;
};

type TransitionRow = {
  transition_id: string;
  employee_id: string;
  from_state: PactState;
  to_state: PactState;
  window_start: string;
  window_end: string;
  triggered_at: string;
  rule_ref: string;
};

export async function createTransition(options: {
  employeeId: string;
  fromState: PactState;
  toState: PactState;
  windowStart: string;
  windowEnd: string;
  ruleRef: string;
}): Promise<Transition> {
  const nowIso = new Date().toISOString();
  const rows = await query<TransitionRow>(
    `INSERT INTO transitions (
       transition_id,
       employee_id,
       from_state,
       to_state,
       window_start,
       window_end,
       triggered_at,
       rule_ref
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING transition_id, employee_id, from_state, to_state, window_start,
               window_end, triggered_at, rule_ref`,
    [
      uuidV7Like(),
      options.employeeId,
      options.fromState,
      options.toState,
      options.windowStart,
      options.windowEnd,
      nowIso,
      options.ruleRef,
    ]
  );

  if (rows.length === 0) {
    throw new Error("Failed to create transition");
  }

  return mapTransition(rows[0]);
}

export async function listTransitions(employeeId?: string): Promise<Transition[]> {
  const rows = await query<TransitionRow>(
    `SELECT transition_id, employee_id, from_state, to_state, window_start,
            window_end, triggered_at, rule_ref
     FROM transitions
     ${employeeId ? "WHERE employee_id = $1" : ""}
     ORDER BY triggered_at DESC`,
    employeeId ? [employeeId] : []
  );
  return rows.map(mapTransition);
}

export async function getLatestTransition(employeeId: string): Promise<Transition | null> {
  const rows = await query<TransitionRow>(
    `SELECT transition_id, employee_id, from_state, to_state, window_start,
            window_end, triggered_at, rule_ref
     FROM transitions
     WHERE employee_id = $1
     ORDER BY triggered_at DESC
     LIMIT 1`,
    [employeeId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapTransition(rows[0]);
}

function mapTransition(row: TransitionRow): Transition {
  return {
    transitionId: row.transition_id,
    employeeId: row.employee_id,
    fromState: row.from_state,
    toState: row.to_state,
    windowStart: row.window_start,
    windowEnd: row.window_end,
    triggeredAt: row.triggered_at,
    ruleRef: row.rule_ref,
  };
}

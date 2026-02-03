import { query } from "../db/pact";
import { uuidV7Like } from "../ids";
import { ensureRole } from "./roles";

export type EmployeeStatus = "active" | "exit";

export type Employee = {
  employeeId: string;
  userId?: string;
  roleId: string;
  status: EmployeeStatus;
  hiredAt: string;
  exitedAt?: string;
  createdAt: string;
  displayName: string;
};

type EmployeeRow = {
  employee_id: string;
  user_id: string | null;
  role_id: string;
  status: EmployeeStatus;
  hired_at: string;
  exited_at: string | null;
  created_at: string;
  display_name: string;
};

export async function createEmployee(options: {
  displayName: string;
  roleId: string;
  hiredAt: string;
  userId?: string;
}): Promise<Employee> {
  const employeeId = uuidV7Like();
  const nowIso = new Date().toISOString();
  await ensureRole(options.roleId);

  const rows = await query<EmployeeRow>(
    `INSERT INTO employees (
       employee_id,
       user_id,
       role_id,
       status,
       hired_at,
       created_at,
       display_name
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING employee_id, user_id, role_id, status, hired_at, exited_at, created_at, display_name`,
    [
      employeeId,
      options.userId ?? null,
      options.roleId,
      "active",
      options.hiredAt,
      nowIso,
      options.displayName,
    ]
  );

  if (rows.length === 0) {
    throw new Error("Failed to create employee");
  }

  return mapEmployee(rows[0]);
}

export async function listEmployees(): Promise<Employee[]> {
  const rows = await query<EmployeeRow>(
    `SELECT employee_id, user_id, role_id, status, hired_at, exited_at, created_at, display_name
     FROM employees
     ORDER BY created_at DESC`
  );
  return rows.map(mapEmployee);
}

export async function getEmployee(employeeId: string): Promise<Employee | null> {
  const rows = await query<EmployeeRow>(
    `SELECT employee_id, user_id, role_id, status, hired_at, exited_at, created_at, display_name
     FROM employees
     WHERE employee_id = $1`,
    [employeeId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapEmployee(rows[0]);
}

export async function listEmployeesForUser(userId: string): Promise<Employee[]> {
  const rows = await query<EmployeeRow>(
    `SELECT employee_id, user_id, role_id, status, hired_at, exited_at, created_at, display_name
     FROM employees
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(mapEmployee);
}

export async function markEmployeeExit(employeeId: string): Promise<void> {
  const rows = await query<{ employee_id: string }>(
    `UPDATE employees
     SET status = 'exit',
         exited_at = $1
     WHERE employee_id = $2
       AND status != 'exit'
     RETURNING employee_id`,
    [new Date().toISOString(), employeeId]
  );
  if (rows.length === 0) {
    throw new Error("Employee not found or already exited");
  }
}

function mapEmployee(row: EmployeeRow): Employee {
  return {
    employeeId: row.employee_id,
    userId: row.user_id ?? undefined,
    roleId: row.role_id,
    status: row.status,
    hiredAt: row.hired_at,
    exitedAt: row.exited_at ?? undefined,
    createdAt: row.created_at,
    displayName: row.display_name,
  };
}

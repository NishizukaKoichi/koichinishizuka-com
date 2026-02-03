import { query } from "../db/pact";

export async function ensureRole(roleId: string): Promise<void> {
  await query(
    `INSERT INTO roles (
       role_id,
       name,
       description,
       created_at
     ) VALUES ($1, $2, $3, $4)
     ON CONFLICT (role_id) DO NOTHING`,
    [roleId, `role:${roleId}`, "auto-created", new Date().toISOString()]
  );
}

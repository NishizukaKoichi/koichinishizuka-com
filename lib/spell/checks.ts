import { query } from "../db/spell";
import { uuidV7Like } from "../ids";

export async function recordScopeCheck(options: {
  spellId: string;
  runtimeId: string;
  userIdentifier: string;
  requestedScope: string;
  allowed: boolean;
}): Promise<void> {
  await query(
    `INSERT INTO scope_check_events (
       check_id,
       spell_id,
       runtime_id,
       user_identifier,
       requested_scope,
       allowed,
       checked_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      uuidV7Like(),
      options.spellId,
      options.runtimeId,
      options.userIdentifier,
      options.requestedScope,
      options.allowed,
      new Date().toISOString(),
    ]
  );
}

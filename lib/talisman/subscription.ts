import { query } from "../db/talisman";

export type TalismanSubscription = {
  personId: string;
  planId: string;
  updatedAt: string;
};

type SubscriptionRow = {
  person_id: string;
  plan_id: string;
  updated_at: string;
};

export async function getSubscription(personId: string): Promise<TalismanSubscription | null> {
  const rows = await query<SubscriptionRow>(
    `SELECT person_id, plan_id, updated_at
     FROM talisman_subscriptions
     WHERE person_id = $1`,
    [personId]
  );
  if (rows.length === 0) {
    return null;
  }
  const row = rows[0];
  return {
    personId: row.person_id,
    planId: row.plan_id,
    updatedAt: row.updated_at,
  };
}

export async function upsertSubscription(options: {
  personId: string;
  planId: string;
}): Promise<TalismanSubscription> {
  const nowIso = new Date().toISOString();
  const rows = await query<SubscriptionRow>(
    `INSERT INTO talisman_subscriptions (
       person_id,
       plan_id,
       updated_at
     ) VALUES ($1, $2, $3)
     ON CONFLICT (person_id)
     DO UPDATE SET plan_id = EXCLUDED.plan_id, updated_at = EXCLUDED.updated_at
     RETURNING person_id, plan_id, updated_at`,
    [options.personId, options.planId, nowIso]
  );

  if (rows.length === 0) {
    throw new Error("Failed to update subscription");
  }

  const row = rows[0];
  return {
    personId: row.person_id,
    planId: row.plan_id,
    updatedAt: row.updated_at,
  };
}

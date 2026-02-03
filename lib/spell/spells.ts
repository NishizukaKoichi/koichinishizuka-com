import { query } from "../db/spell";
import { uuidV7Like } from "../ids";

export type SpellStatus = "active" | "inactive";
export type SpellType = "one_time" | "subscription";

export type Spell = {
  spellId: string;
  name: string;
  sku: string;
  status: SpellStatus;
  type: SpellType;
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt: string;
};

type SpellRow = {
  spell_id: string;
  name: string;
  sku: string;
  status: SpellStatus;
  type: SpellType;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
};

export async function createSpell(options: {
  name: string;
  sku: string;
  type: SpellType;
  status?: SpellStatus;
  stripeProductId?: string;
  stripePriceId?: string;
}): Promise<Spell> {
  const spellId = uuidV7Like();
  const status = options.status ?? "active";
  const nowIso = new Date().toISOString();

  const rows = await query<SpellRow>(
    `INSERT INTO spells (
       spell_id,
       name,
       sku,
       status,
       type,
       stripe_product_id,
       stripe_price_id,
       created_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING spell_id, name, sku, status, type, stripe_product_id, stripe_price_id, created_at`,
    [
      spellId,
      options.name,
      options.sku,
      status,
      options.type,
      options.stripeProductId ?? null,
      options.stripePriceId ?? null,
      nowIso,
    ]
  );

  if (rows.length === 0) {
    throw new Error("Failed to create spell");
  }

  return mapSpell(rows[0]);
}

export async function listSpells(): Promise<Spell[]> {
  const rows = await query<SpellRow>(
    `SELECT spell_id, name, sku, status, type, stripe_product_id, stripe_price_id, created_at
     FROM spells
     ORDER BY created_at DESC`
  );
  return rows.map(mapSpell);
}

export async function getSpell(spellId: string): Promise<Spell | null> {
  const rows = await query<SpellRow>(
    `SELECT spell_id, name, sku, status, type, stripe_product_id, stripe_price_id, created_at
     FROM spells
     WHERE spell_id = $1`,
    [spellId]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapSpell(rows[0]);
}

export async function updateSpellStatus(options: {
  spellId: string;
  status: SpellStatus;
}): Promise<void> {
  const rows = await query<{ spell_id: string }>(
    `UPDATE spells
     SET status = $1
     WHERE spell_id = $2
     RETURNING spell_id`,
    [options.status, options.spellId]
  );
  if (rows.length === 0) {
    throw new Error("Spell not found");
  }
}

function mapSpell(row: SpellRow): Spell {
  return {
    spellId: row.spell_id,
    name: row.name,
    sku: row.sku,
    status: row.status,
    type: row.type,
    stripeProductId: row.stripe_product_id ?? undefined,
    stripePriceId: row.stripe_price_id ?? undefined,
    createdAt: row.created_at,
  };
}

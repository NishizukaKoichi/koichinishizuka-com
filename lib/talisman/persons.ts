import { query } from "../db/talisman";
import { uuidV7Like } from "../ids";
import { recordEvent } from "./events";

export type Person = {
  personId: string;
  createdAt: string;
};

type PersonRow = {
  person_id: string;
  created_at: string;
};

export async function createPerson(): Promise<Person> {
  const personId = uuidV7Like();
  const rows = await query<PersonRow>(
    `INSERT INTO persons (
       person_id,
       created_at
     ) VALUES ($1, $2)
     RETURNING person_id, created_at`,
    [personId, new Date().toISOString()]
  );

  if (rows.length === 0) {
    throw new Error("Failed to create person");
  }

  await recordEvent({ personId, eventType: "person_created" });

  return {
    personId: rows[0].person_id,
    createdAt: rows[0].created_at,
  };
}

export async function getPerson(personId: string): Promise<Person | null> {
  const rows = await query<PersonRow>(
    `SELECT person_id, created_at
     FROM persons
     WHERE person_id = $1`,
    [personId]
  );
  if (rows.length === 0) {
    return null;
  }
  return { personId: rows[0].person_id, createdAt: rows[0].created_at };
}

export async function ensurePerson(personId: string): Promise<Person> {
  const existing = await getPerson(personId);
  if (existing) {
    return existing;
  }
  const rows = await query<PersonRow>(
    `INSERT INTO persons (
       person_id,
       created_at
     ) VALUES ($1, $2)
     RETURNING person_id, created_at`,
    [personId, new Date().toISOString()]
  );
  if (rows.length === 0) {
    throw new Error("Failed to create person");
  }
  await recordEvent({ personId, eventType: "person_created" });
  return { personId: rows[0].person_id, createdAt: rows[0].created_at };
}

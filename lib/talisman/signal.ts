import { query } from "../db/talisman";
import type { CredentialType } from "./credentials";

export type TalismanSignal = {
  personId: string;
  score: number;
  flags: {
    has_email: boolean;
    has_phone: boolean;
    has_oauth: boolean;
    has_payment: boolean;
    has_passkey: boolean;
  };
};

type CredentialRow = {
  type: CredentialType;
};

export async function getSignal(personId: string): Promise<TalismanSignal> {
  const rows = await query<CredentialRow>(
    `SELECT type
     FROM credentials
     WHERE person_id = $1
       AND revoked_at IS NULL`,
    [personId]
  );

  const flags = {
    has_email: false,
    has_phone: false,
    has_oauth: false,
    has_payment: false,
    has_passkey: false,
  };

  for (const row of rows) {
    if (row.type === "email_magiclink") {
      flags.has_email = true;
    }
    if (row.type === "phone_otp") {
      flags.has_phone = true;
    }
    if (row.type.startsWith("oauth_")) {
      flags.has_oauth = true;
    }
    if (row.type === "payment_card") {
      flags.has_payment = true;
    }
    if (row.type === "passkey") {
      flags.has_passkey = true;
    }
  }

  return {
    personId,
    score: rows.length,
    flags,
  };
}

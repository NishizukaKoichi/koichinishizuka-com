import crypto from "node:crypto";
import type Stripe from "stripe";
import { getStripe } from "../stripe";
import { query } from "../db";
import { upsertEntitlement } from "./entitlements";
import { recordAuditEvent } from "./audit";

type StripeLedgerRow = {
  stripe_event_id: string;
  payload_hash: string;
  received_at: string;
  processed_at: string | null;
};

export type StripeLedgerEntry = {
  stripeEventId: string;
  payloadHash: string;
  receivedAt: string;
  processedAt?: string;
};

function hashPayload(payload: string): string {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function recordStripeEvent(options: {
  eventId: string;
  rawPayload: string;
}): Promise<boolean> {
  const rows = await query<{ stripe_event_id: string }>(
    `INSERT INTO stripe_event_ledger (
       stripe_event_id,
       payload_hash,
       received_at
     ) VALUES ($1, $2, $3)
     ON CONFLICT (stripe_event_id) DO NOTHING
     RETURNING stripe_event_id`,
    [options.eventId, hashPayload(options.rawPayload), new Date().toISOString()]
  );
  return rows.length > 0;
}

export async function markStripeEventProcessed(eventId: string): Promise<void> {
  await query(
    `UPDATE stripe_event_ledger
     SET processed_at = $1
     WHERE stripe_event_id = $2`,
    [new Date().toISOString(), eventId]
  );
}

export async function listUnprocessedStripeEvents(limit = 50): Promise<string[]> {
  const rows = await query<StripeLedgerRow>(
    `SELECT stripe_event_id, received_at, processed_at
     FROM stripe_event_ledger
     WHERE processed_at IS NULL
     ORDER BY received_at ASC
     LIMIT $1`,
    [limit]
  );
  return rows.map((row) => row.stripe_event_id);
}

export async function listStripeLedger(options: { limit?: number } = {}): Promise<StripeLedgerEntry[]> {
  const limit = options.limit ?? 100;
  const rows = await query<StripeLedgerRow>(
    `SELECT stripe_event_id, payload_hash, received_at, processed_at
     FROM stripe_event_ledger
     ORDER BY received_at DESC
     LIMIT $1`,
    [limit]
  );

  return rows.map((row) => ({
    stripeEventId: row.stripe_event_id,
    payloadHash: row.payload_hash,
    receivedAt: row.received_at,
    processedAt: row.processed_at ?? undefined,
  }));
}

export async function processStripeEvent(event: Stripe.Event): Promise<void> {
  const metadata = extractMetadata(event);
  if (!metadata) {
    return;
  }

  const { spellId, userIdentifier } = metadata;
  const status = mapEventToStatus(event.type);
  if (!status) {
    return;
  }

  await upsertEntitlement({
    spellId,
    userIdentifier,
    status,
    sourceEventId: event.id,
  });

  await recordAuditEvent({
    eventName: status === "active" ? "entitlement_granted" : "entitlement_revoked",
    targetId: spellId,
    metadata: { userIdentifier, eventType: event.type },
  });
}

function mapEventToStatus(eventType: string): "active" | "revoked" | null {
  if (eventType === "checkout.session.completed") {
    return "active";
  }
  if (eventType === "customer.subscription.deleted") {
    return "revoked";
  }
  return null;
}

function extractMetadata(event: Stripe.Event): {
  spellId: string;
  userIdentifier: string;
} | null {
  const dataObject = event.data?.object as { metadata?: Record<string, string> } | undefined;
  const metadata = dataObject?.metadata ?? {};
  const spellId = metadata.spell_id;
  const userIdentifier = metadata.user_identifier;
  if (!spellId || !userIdentifier) {
    return null;
  }
  return { spellId, userIdentifier };
}

export async function reconcileStripeEvents(): Promise<{ processed: number }> {
  const eventIds = await listUnprocessedStripeEvents();
  if (eventIds.length === 0) {
    return { processed: 0 };
  }

  const stripe = getStripe();
  let processed = 0;
  for (const eventId of eventIds) {
    const event = await stripe.events.retrieve(eventId);
    await processStripeEvent(event);
    await markStripeEventProcessed(eventId);
    processed += 1;
  }

  await recordAuditEvent({
    eventName: "reconcile_executed",
    metadata: { processed },
  });

  return { processed };
}

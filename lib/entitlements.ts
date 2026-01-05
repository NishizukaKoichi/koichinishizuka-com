export type EntitlementStatus = "active" | "revoked";

export type Entitlement = {
  userId: string;
  planKey: string;
  status: EntitlementStatus;
  updatedAt: string;
};

export type StripeEventLike = {
  type: string;
  data?: {
    object?: {
      metadata?: Record<string, string>;
    };
  };
};

type EntitlementStore = {
  entitlements: Map<string, Entitlement>;
};

const globalStore = globalThis as unknown as { __entitlementStore?: EntitlementStore };

const entitlementStore: EntitlementStore =
  globalStore.__entitlementStore ??
  (globalStore.__entitlementStore = {
    entitlements: new Map<string, Entitlement>(),
  });

function extractPlanKey(payload: StripeEventLike): string | null {
  const planKey = payload?.data?.object?.metadata?.planKey;
  return planKey ?? null;
}

export async function getEntitlement(userId: string): Promise<Entitlement | null> {
  return entitlementStore.entitlements.get(userId) ?? null;
}

export async function setEntitlementFromStripeEvent(
  userId: string,
  payload: StripeEventLike
): Promise<Entitlement | null> {
  const planKey = extractPlanKey(payload);
  if (!planKey) {
    return null;
  }

  let status: EntitlementStatus | null = null;
  if (payload.type === "checkout.session.completed") {
    status = "active";
  }
  if (payload.type === "customer.subscription.deleted") {
    status = "revoked";
  }

  if (!status) {
    return null;
  }

  const entitlement: Entitlement = {
    userId,
    planKey,
    status,
    updatedAt: new Date().toISOString(),
  };

  entitlementStore.entitlements.set(userId, entitlement);
  return entitlement;
}

// Replace entitlementStore with a DB-backed implementation using entitlements table.

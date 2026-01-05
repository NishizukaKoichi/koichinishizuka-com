import { billingConfig, type PlanDefinition } from "../config/billing";

type PlanPriceRecord = {
  planKey: string;
  stripePriceId: string;
  isActive: boolean;
};

type PricingStore = {
  activePrices: Map<string, string>;
};

const globalStore = globalThis as unknown as { __pricingStore?: PricingStore };

const pricingStore: PricingStore =
  globalStore.__pricingStore ??
  (globalStore.__pricingStore = {
    activePrices: new Map<string, string>(),
  });

export async function listPlans(): Promise<PlanDefinition[]> {
  return billingConfig.plans;
}

export async function getActivePriceIdForPlan(planKey: string): Promise<string | null> {
  return pricingStore.activePrices.get(planKey) ?? null;
}

export async function setActivePriceIdForPlan(
  planKey: string,
  stripePriceId: string
): Promise<void> {
  pricingStore.activePrices.set(planKey, stripePriceId);
}

export async function listActivePrices(): Promise<PlanPriceRecord[]> {
  return billingConfig.plans.map((plan) => ({
    planKey: plan.planKey,
    stripePriceId: pricingStore.activePrices.get(plan.planKey) ?? "",
    isActive: pricingStore.activePrices.has(plan.planKey),
  }));
}

// Replace pricingStore with a DB-backed implementation using product_plan_prices.

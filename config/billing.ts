export type BillingMode = "subscription" | "one_time";

export type PlanDefinition = {
  planKey: string;
  displayName: string;
  features: string[];
  limits?: Record<string, number | string>;
  requireEntitlement: boolean;
};

export const billingConfig = {
  mode: "subscription" as BillingMode,
  successPath: "/dashboard",
  cancelPath: "/plans",
  plans: [
    {
      planKey: "starter",
      displayName: "Starter",
      features: ["Core workflow access", "Basic usage limits"],
      limits: { projects: 3 },
      requireEntitlement: true,
    },
    {
      planKey: "pro",
      displayName: "Pro",
      features: ["Everything in Starter", "Higher limits", "Priority workflow"],
      limits: { projects: 50 },
      requireEntitlement: true,
    },
  ],
};

// Billing notes:
// - Do not treat return URLs as payment confirmation.
// - Webhook events are the source of truth for entitlements.
// - metadata.planKey is required on Stripe objects.

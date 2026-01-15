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
      planKey: "time_window",
      displayName: "Time Window",
      features: ["Read other Epoch within a specific time window"],
      requireEntitlement: true,
    },
    {
      planKey: "read_session",
      displayName: "Read Session",
      features: ["Read other Epoch for a session"],
      requireEntitlement: true,
    },
  ],
};

// Billing notes:
// - Do not treat return URLs as payment confirmation.
// - Webhook events are the source of truth for entitlements.
// - metadata.planKey is required on Stripe objects.

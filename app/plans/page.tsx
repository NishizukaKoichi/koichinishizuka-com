"use client";

import { useState } from "react";
import { billingConfig } from "../../config/billing";

export default function PlansPage() {
  const [error, setError] = useState<string | null>(null);
  const [loadingPlanKey, setLoadingPlanKey] = useState<string | null>(null);
  const userId = "demo-user";

  const startCheckout = async (planKey: string) => {
    setError(null);
    setLoadingPlanKey(planKey);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, userId }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Checkout failed");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoadingPlanKey(null);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Plans</h1>
      <p>Pricing is shown only in Stripe Checkout. Select a plan to continue.</p>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {billingConfig.plans.map((plan) => (
          <li
            key={plan.planKey}
            style={{ border: "1px solid #ddd", padding: "1rem", marginBottom: "1rem" }}
          >
            <h2>{plan.displayName}</h2>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            {plan.requireEntitlement ? (
              <button
                type="button"
                onClick={() => startCheckout(plan.planKey)}
                disabled={loadingPlanKey === plan.planKey}
              >
                {loadingPlanKey === plan.planKey ? "Starting..." : "Purchase"}
              </button>
            ) : (
              <p>Included by default.</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

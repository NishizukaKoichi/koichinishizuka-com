"use client";

import { useEffect, useState } from "react";
import { billingConfig } from "../../../config/billing";

type ActivePrice = {
  planKey: string;
  stripePriceId: string;
  isActive: boolean;
};

export default function AdminPricingPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [prices, setPrices] = useState<ActivePrice[]>([]);
  const [planKey, setPlanKey] = useState(billingConfig.plans[0]?.planKey ?? "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPrices = async (email: string) => {
    if (!email) {
      return;
    }
    setError(null);
    try {
      const response = await fetch("/api/admin/pricing", {
        method: "GET",
        headers: { "x-user-email": email },
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to load prices");
      }
      const data = await response.json();
      setPrices(data.activePrices ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prices");
    }
  };

  useEffect(() => {
    if (adminEmail) {
      void loadPrices(adminEmail);
    }
  }, [adminEmail]);

  const submitPrice = async () => {
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": adminEmail,
        },
        body: JSON.stringify({
          planKey,
          amount: Number(amount),
          currency,
          interval,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to update price");
      }

      const payload = await response.json();
      setMessage(`Active price updated: ${payload.priceId}`);
      await loadPrices(adminEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update price");
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Admin Pricing</h1>
      <p>Admin only. Set allowlist in env and use your email here.</p>

      <label style={{ display: "block", marginBottom: "1rem" }}>
        Admin email
        <input
          style={{ display: "block", width: "100%" }}
          value={adminEmail}
          onChange={(event) => setAdminEmail(event.target.value)}
          placeholder="admin@example.com"
        />
      </label>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Active Prices</h2>
        {prices.length === 0 ? (
          <p>No active prices loaded.</p>
        ) : (
          <ul>
            {prices.map((price) => (
              <li key={price.planKey}>
                {price.planKey}: {price.stripePriceId || "(not set)"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Create New Stripe Price</h2>
        <p>Amount is in the smallest currency unit (ex: cents).</p>

        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Plan
          <select
            style={{ display: "block" }}
            value={planKey}
            onChange={(event) => setPlanKey(event.target.value)}
          >
            {billingConfig.plans.map((plan) => (
              <option key={plan.planKey} value={plan.planKey}>
                {plan.displayName} ({plan.planKey})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Amount
          <input
            style={{ display: "block" }}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1000"
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Currency
          <input
            style={{ display: "block" }}
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            placeholder="usd"
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Interval
          <select
            style={{ display: "block" }}
            value={interval}
            onChange={(event) => setInterval(event.target.value as "month" | "year")}
          >
            <option value="month">month</option>
            <option value="year">year</option>
          </select>
        </label>

        <button type="button" onClick={submitPrice}>
          Create and Activate
        </button>
      </section>

      {message ? <p style={{ color: "green" }}>{message}</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
    </main>
  );
}

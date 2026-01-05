import { getEntitlement } from "../../lib/entitlements";

export default async function DashboardPage() {
  const userId = "demo-user";
  const entitlement = await getEntitlement(userId);

  return (
    <main style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Dashboard</h1>
      <p>User: {userId}</p>
      <section>
        <h2>Entitlement Status</h2>
        {entitlement ? (
          <div>
            <p>Plan: {entitlement.planKey}</p>
            <p>Status: {entitlement.status}</p>
            <p>Updated: {entitlement.updatedAt}</p>
          </div>
        ) : (
          <p>No active entitlements yet.</p>
        )}
      </section>
    </main>
  );
}

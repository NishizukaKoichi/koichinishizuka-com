import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Product App Template</h1>
      <p>
        This template ships a docs gate, Stripe billing wiring, entitlements model,
        minimal UI flow, and analytics stubs.
      </p>
      <ul>
        <li>
          <Link href="/plans">Plans</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/admin/pricing">Admin Pricing</Link>
        </li>
      </ul>
    </main>
  );
}

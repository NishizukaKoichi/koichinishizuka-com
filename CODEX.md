# Codex Instructions

- This repo is a gate. Do not proceed if docs have __REQUIRED__ placeholders.
- Never hardcode price details (amount/currency/interval/priceId) in code, env, or docs.
- Only planKey may flow through UI/API; resolve Stripe Price IDs server-side.
- Entitlements in the DB are the sole execution gate; Stripe is not the truth.
- Webhooks are the source of truth; return URLs are not confirmation.
- Keep DB access behind thin interfaces so overlays can replace implementations.
- Stack and dependency pinning are enforced by product-contracts (SSOT).

# {{PRODUCT_NAME}}

{{ONE_LINER}}

This repo is a gate, not documentation. If required fields are blank, you are not done.

## Done Definition
- Deploy: the app is live in a real environment and reachable by target users.
- Billing: Stripe Checkout + Webhook are wired, and entitlements update from webhook events.
- Continued usage: users can reach the value loop again without human help.

## Status
- Completed: Spec / Docs Gate v1
- Next: add build/test after product-contracts integration

## Docs Gate (Read Order)
1. docs/index.md
2. docs/value.md
3. docs/value-map.md
4. docs/mvp.md
5. docs/flow/user-flow.md
6. docs/flow/state.md
7. docs/billing/payment-boundary.md
8. docs/analytics/metrics.md
9. docs/insights/paid-users.md
10. docs/spec/api.md
11. docs/spec/schema.md
12. docs/ops/assumptions.md
13. docs/ops/release.md
14. docs/done.md

## Reference Specs (Non-Gate)
- `docs/spec/koichinishizuka-ui-spec.md`
- `docs/spec/epoch-spec-v1.2.md`
- `docs/spec/sigil-spec.md`
- `docs/spec/talisman-spec-v1.0.md`
- `docs/spec/pact-spec-v1.0.md`

## Pricing Independence (Prompt-8)
- Price details (amount/currency/interval/priceId) do not exist in code, env, or docs.
- Sellers set pricing later in /admin/pricing and can change it only by creating a new Stripe Price and switching Active.
- Execution access is decided only by entitlements in the DB, not by Stripe Price IDs.
- Entitlements are updated only by Stripe Webhook events; return URLs are never treated as payment confirmation.

## Getting Started
- Fill required fields in docs/*.md.
- Run `node scripts/verify.mjs` until it prints OK.
- Run `pnpm env:check` before deploy/startup.
- Run `pnpm smoke` against a running app before release.
- Optionally run `node scripts/init.mjs <product-name> <display-name?>` to replace README placeholders.

## Deploy Commands
- `pnpm deploy:platform`
- `pnpm deploy:epoch`
- `pnpm deploy:sigil`
- `pnpm deploy:pact`
- `pnpm deploy:talisman`
- `pnpm deploy:spell`

For target previews:
- `pnpm deploy:target -- --target <platform|epoch|sigil|pact|talisman|spell> --preview`

## SSOT
This template assumes stack and dependency pinning are enforced in product-contracts (SSOT).

# koichinishizuka.com

koichinishizuka.com is the mother-ship repository for five products:
`epoch`, `sigil`, `pact`, `talisman`, and `spell`.

This repo contains:
- Site UI and product UIs (single Next.js app)
- Product APIs (`/api/v1/...` and `/api/...`)
- Product specs in `docs/spec`
- Product-specific SQL schemas in `db/`

## Product Routes
- `/epoch`
- `/sigil`
- `/pact`
- `/talisman`
- `/spell`

## Architecture
- App runtime: Next.js App Router
- Data model: product-isolated databases
- Deployment model: koichinishizuka.com (platform) first, then product deployments

## Required Environment Variables
See `.env.example`.

Core variables:
- `APP_BASE_URL`
- `PLATFORM_DATABASE_URL`
- `EPOCH_DATABASE_URL`
- `SIGIL_DATABASE_URL`
- `PACT_DATABASE_URL`
- `TALISMAN_DATABASE_URL`
- `SPELL_DATABASE_URL`

Optional:
- `ADMIN_EMAIL_ALLOWLIST`
- `ADMIN_DOMAIN_ALLOWLIST`
- `DEFAULT_USER_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Local Development
### Prerequisites
- Node `>=24.12.0 <25`
- pnpm `10.25.0`

### Install
```bash
pnpm install
```

### Run
```bash
pnpm dev
```

### Quality Gates
```bash
pnpm verify
pnpm lint
pnpm build
pnpm stack:apply
pnpm stack:check
```

## Documentation
Start here:
- `docs/index.md`

Docs gate read order:
1. `docs/index.md`
2. `docs/value.md`
3. `docs/value-map.md`
4. `docs/mvp.md`
5. `docs/flow/user-flow.md`
6. `docs/flow/state.md`
7. `docs/billing/payment-boundary.md`
8. `docs/analytics/metrics.md`
9. `docs/insights/paid-users.md`
10. `docs/spec/api.md`
11. `docs/spec/schema.md`
12. `docs/ops/assumptions.md`
13. `docs/ops/release.md`
14. `docs/done.md`

Non-gate product specs are under `docs/spec/`.

## Notes
- Pricing amount/currency/interval/priceId must not be hard-coded in docs or code.
- Entitlements are the execution gate.
- Stripe webhook events are the source for billing state transitions.

# Deploy Runbook

## Goal
Run `koichinishizuka.com` and each product deployment with isolated DBs, isolated Vercel projects, and fail-closed startup checks.

## Deploy Topology
- `koichinishizuka.com` (platform shell) -> Vercel project: `koichinishizuka-com`
- `epoch` -> `koichinishizuka-epoch`
- `sigil` -> `koichinishizuka-sigil`
- `pact` -> `koichinishizuka-pact`
- `talisman` -> `koichinishizuka-talisman`
- `spell` -> `koichinishizuka-spell`

Each deployment sets `DEPLOY_TARGET` to exactly one target, and only that route/API surface is exposed by middleware.

## Required Environment Variables (by DEPLOY_TARGET)
- `platform`: `APP_BASE_URL`, `PLATFORM_DATABASE_URL`
- `epoch`: `APP_BASE_URL`, `EPOCH_DATABASE_URL`
- `sigil`: `APP_BASE_URL`, `SIGIL_DATABASE_URL`
- `pact`: `APP_BASE_URL`, `PACT_DATABASE_URL`
- `talisman`: `APP_BASE_URL`, `TALISMAN_DATABASE_URL`
- `spell`: `APP_BASE_URL`, `SPELL_DATABASE_URL`
- `all` (single-env local/dev only): all DB URLs + `APP_BASE_URL`

Stripe must be configured as a pair:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Optional but Recommended
- `ADMIN_EMAIL_ALLOWLIST` or `ADMIN_DOMAIN_ALLOWLIST`
- `EXEC_USER_ID_ALLOWLIST` or `EXEC_EMAIL_ALLOWLIST` or `EXEC_DOMAIN_ALLOWLIST`
- `INTERNAL_REQUEST_SECRET` (required if trusted internal services forward `x-user-id`)
- `ALLOW_DEV_HEADER_AUTH` (`0` in production)

## Pre-Deploy Steps
1. Install dependencies with Node `24.12.x` and pnpm `10.25.x`.
2. Run `pnpm env:check` with the intended `DEPLOY_TARGET`.
3. Run `pnpm lint`.
4. Run `pnpm build`.

If `pnpm env:check` fails, stop deployment.

## Deploy Sequence (Production)
1. Deploy platform first:
   - `pnpm deploy:platform`
2. Deploy product projects in order:
   - `pnpm deploy:epoch`
   - `pnpm deploy:sigil`
   - `pnpm deploy:pact`
   - `pnpm deploy:talisman`
   - `pnpm deploy:spell`

For preview deploys, run:
- `pnpm deploy:target -- --target <platform|epoch|sigil|pact|talisman|spell> --preview`

## Post-Deploy Verification
1. Platform (`koichinishizuka.com`) root and `/_next` assets load.
2. Product root redirects:
   - `koichinishizuka-epoch/*` redirects `/` -> `/epoch`
   - same pattern for `sigil/pact/talisman/spell`
3. Cross-surface route blocking:
   - calling a non-target product path on each project returns `404`.
4. Guard endpoints:
   - token/auth endpoints respond
   - `spell` check endpoint respects entitlement guards
   - privileged endpoints deny when allowlists are not satisfied

## Rollback
1. Revert to last known good deployment in Vercel.
2. Keep DBs unchanged (append-only assumptions remain valid).
3. Re-run `pnpm env:check` with the target value before re-promoting.

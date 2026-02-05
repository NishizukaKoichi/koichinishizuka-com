# Deploy Runbook

## Goal
Run `koichinishizuka.com` in production with isolated DBs per product and fail-closed startup checks.

## Required Environment Variables
- `APP_BASE_URL`
- `PLATFORM_DATABASE_URL`
- `EPOCH_DATABASE_URL`
- `SIGIL_DATABASE_URL`
- `PACT_DATABASE_URL`
- `TALISMAN_DATABASE_URL`
- `SPELL_DATABASE_URL`

Stripe must be configured as a pair:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Optional but Recommended
- `ADMIN_EMAIL_ALLOWLIST` or `ADMIN_DOMAIN_ALLOWLIST`
- `EXEC_USER_ID_ALLOWLIST` or `EXEC_EMAIL_ALLOWLIST` or `EXEC_DOMAIN_ALLOWLIST`

## Pre-Deploy Steps
1. Install dependencies with Node `24.12.x` and pnpm `10.25.x`.
2. Run `pnpm env:check`.
3. Run `pnpm lint`.
4. Run `pnpm build`.

If `pnpm env:check` fails, stop deployment.

## Deploy Steps
1. Set all required env vars in Vercel target environment.
2. Deploy the current commit.
3. Verify `/api/v1/token` and `/api/v1/spell/check` return expected auth/guard behavior.
4. Verify `/intents` and `/runs` are denied without allowlist.

## Rollback
1. Revert to last known good deployment in Vercel.
2. Keep DBs unchanged (append-only assumptions remain valid).
3. Re-run `pnpm env:check` before re-promoting.

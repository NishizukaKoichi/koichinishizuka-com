# Smoke Tests

## Command
- `pnpm smoke`

## Flows
1. `SMOKE_FLOW=platform` (default)
- Validates `koichinishizuka.com` mother-ship paths and Epoch write/read.

2. `SMOKE_FLOW=full`
- Extends platform flow with developer key + token + spell check + revoke path.

3. `SMOKE_FLOW=target-guard`
- Validates dedicated target deployment surface isolation (`404` for foreign pages/APIs).
- Requires `SMOKE_TARGET=epoch|sigil|pact|talisman|spell`.
- Example:
  - `SMOKE_BASE_URL=https://koichinishizuka-epoch.vercel.app SMOKE_FLOW=target-guard SMOKE_TARGET=epoch pnpm smoke`

## What it validates
1. Epoch write/read path
- Create record via `POST /api/records`
- Read back via `GET /api/records/self`

2. Platform key/token path
- Create developer key
- Grant `spell.check` scope
- Issue access + refresh tokens
- Refresh access token

3. Spell execution gate path
- Call `POST /api/v1/spell/check`
- Verify response shape (`allowed` boolean)

4. Key revocation path
- Revoke developer key

## Environment
- Target URL is read from `SMOKE_BASE_URL` then `APP_BASE_URL`, fallback `http://localhost:3000`.
- App must be running before smoke starts.
- For auth-required platform APIs, smoke uses a cookie-based user identity (`SMOKE_AUTH_COOKIE_NAME`, default `user_id`).
- `SMOKE_INTERNAL_REQUEST_SECRET` is optional and only used when internal header trust is enabled.

## Failure behavior
- Any failed assertion exits with non-zero code.
- Error payload is printed for quick triage.

# Docs Gate

This is a gate, not reference material. Required fields must be completed before any build or implementation.

## How to Use
- Read the docs in the order listed in README.
- Replace all REQUIRED placeholders in required sections.
- Epoch 技術仕様書は docs/spec/technical-spec.md を参照する。
- Run `node scripts/verify.mjs` until it prints OK.

## Rules
- Prices are not defined here. Do not add amount/currency/interval/priceId anywhere in docs.
- Plan keys are allowed. Pricing is set later by sellers in /admin/pricing.
- Entitlements are the only execution gate; Stripe is not the truth.

## Reference Specs (Non-Gate)
- koichinishizuka.com UI仕様書: docs/spec/koichinishizuka-ui-spec.md
- koichinishizuka.com Platform API spec: docs/spec/koichinishizuka-platform-api-spec.md
- koichinishizuka.com Platform schema: docs/spec/koichinishizuka-platform-schema.md
- Epoch consolidated spec v1.2: docs/spec/epoch-spec-v1.2.md
- Spell fixed spec: docs/spec/spell-fixed-spec.md
- Spell Runtime spec: docs/spec/spell-runtime-spec.md
- Spell API spec: docs/spec/spell-api.md
- Spell schema: docs/spec/spell-schema.md
- Sigil spec: docs/spec/sigil-spec.md
- Sigil API spec: docs/spec/sigil-api.md
- Sigil schema: docs/spec/sigil-schema.md
- Talisman spec v1.0: docs/spec/talisman-spec-v1.0.md
- Pact spec v1.0: docs/spec/pact-spec-v1.0.md
- Pact API spec: docs/spec/pact-api.md
- Pact schema: docs/spec/pact-schema.md

## Implementation Map (Non-Gate)
- UI → Backend gap matrix: docs/implementation/ui-backend-gap.md
- Deploy runbook: docs/ops/deploy-runbook.md

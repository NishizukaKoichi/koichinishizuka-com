# Docs Gate

This is a gate, not reference material. Required fields must be completed before any build or implementation.

## How to Use
- Read the docs in the order listed in README.
- Replace all __REQUIRED:...__ placeholders in required sections.
- Run `node scripts/verify.mjs` until it prints OK.

## Rules
- Prices are not defined here. Do not add amount/currency/interval/priceId anywhere in docs.
- Plan keys are allowed. Pricing is set later by sellers in /admin/pricing.
- Entitlements are the only execution gate; Stripe is not the truth.

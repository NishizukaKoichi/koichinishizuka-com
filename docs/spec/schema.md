# Schema Spec

Required fields. Do not proceed if any __REQUIRED:...__ remain.

## Tables
- users
- billing_customers
- subscriptions
- product_plans
- product_plan_prices
- entitlements

## Notes
- Entitlements are the only execution gate.
- Stripe Price IDs are reference-only; logic must never branch on priceId.

## Required Changes for Your Product
- __REQUIRED:schema_changes__

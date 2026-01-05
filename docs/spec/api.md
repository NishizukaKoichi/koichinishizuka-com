# API Spec

Required fields. Do not proceed if any __REQUIRED:...__ remain.

## Public Endpoints
- __REQUIRED:public_endpoints__

## Auth/Identity Assumptions
- __REQUIRED:auth_assumptions__

## Billing Endpoints
- POST /api/billing/checkout: planKey -> Checkout URL
- POST /api/billing/portal: stripeCustomerId -> Portal URL
- POST /api/stripe/webhook: Stripe Webhook events
- POST /api/admin/pricing: create new Stripe Price and set active

## Error Handling
- __REQUIRED:error_handling__

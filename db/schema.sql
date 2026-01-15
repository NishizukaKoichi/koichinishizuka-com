-- SQL schema (minimal, replace in overlay as needed)

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE billing_customers (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMPTZ,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_plans (
  plan_key TEXT PRIMARY KEY,
  cap TEXT,
  require_entitlement BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_plan_prices (
  plan_key TEXT NOT NULL REFERENCES product_plans(plan_key) ON DELETE CASCADE,
  stripe_price_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce one active price per plan (Postgres partial index).
CREATE UNIQUE INDEX product_plan_prices_active_idx
  ON product_plan_prices(plan_key)
  WHERE is_active;

CREATE TABLE entitlements (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_key TEXT NOT NULL REFERENCES product_plans(plan_key) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, plan_key)
);

-- Execution gates must reference entitlements only.
-- Stripe Price IDs are reference-only and must not drive logic.

-- Epoch core tables (immutable record store).

CREATE TABLE epoch_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE epoch_records (
  record_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL,
  record_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  prev_hash TEXT,
  record_hash TEXT NOT NULL UNIQUE,
  visibility TEXT NOT NULL CHECK (visibility IN ('private', 'scout_visible', 'public'))
);

CREATE INDEX epoch_records_user_time_idx
  ON epoch_records(user_id, recorded_at);

CREATE TABLE epoch_attachments (
  attachment_id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES epoch_records(record_id) ON DELETE RESTRICT,
  attachment_hash TEXT NOT NULL,
  storage_pointer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

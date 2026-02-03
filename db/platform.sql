-- koichinishizuka.com platform schema (developer keys / scopes / tokens)

CREATE TABLE developer_keys (
  key_id TEXT PRIMARY KEY,
  secret_hash TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

CREATE TABLE developer_key_scopes (
  key_id TEXT NOT NULL REFERENCES developer_keys(key_id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('granted', 'revoked')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('free', 'metered', 'review')),
  condition_ref TEXT,
  PRIMARY KEY (key_id, scope)
);

CREATE TABLE entitlements (
  entitlement_id TEXT PRIMARY KEY,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  reason TEXT,
  UNIQUE (subject_type, subject_id, scope)
);

CREATE TABLE access_tokens (
  token_id TEXT PRIMARY KEY,
  key_id TEXT NOT NULL REFERENCES developer_keys(key_id) ON DELETE CASCADE,
  scopes JSONB NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  token_hash TEXT NOT NULL
);

CREATE TABLE refresh_tokens (
  token_id TEXT PRIMARY KEY,
  key_id TEXT NOT NULL REFERENCES developer_keys(key_id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  token_hash TEXT NOT NULL
);

CREATE TABLE meter_events (
  event_id TEXT PRIMARY KEY,
  key_id TEXT NOT NULL REFERENCES developer_keys(key_id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  request_id TEXT NOT NULL,
  counted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('counted', 'ignored'))
);

CREATE TABLE audit_logs (
  audit_id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  actor_user_id TEXT,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX developer_key_owner_idx
  ON developer_keys(owner_user_id, created_at DESC);

CREATE INDEX entitlements_subject_idx
  ON entitlements(subject_type, subject_id, status);

CREATE INDEX access_tokens_key_idx
  ON access_tokens(key_id, expires_at DESC);

CREATE INDEX refresh_tokens_key_idx
  ON refresh_tokens(key_id, expires_at DESC);

-- capability intents + runs (execution overlay)
CREATE TABLE intents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  args JSONB,
  status TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  intent_id TEXT NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
  output JSONB,
  error JSONB,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, idempotency_key)
);

CREATE INDEX intents_user_created_at_idx
  ON intents(user_id, created_at DESC);

CREATE INDEX runs_user_created_at_idx
  ON runs(user_id, created_at DESC);

CREATE INDEX runs_intent_created_at_idx
  ON runs(intent_id, created_at DESC);

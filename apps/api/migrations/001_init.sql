-- 001_init.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number TEXT UNIQUE NOT NULL,
  product_version TEXT NOT NULL,
  state_code TEXT NOT NULL,
  term_months INT NOT NULL CHECK (term_months IN (72,84,96)),
  commercial BOOLEAN NOT NULL DEFAULT FALSE,
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  contract_price NUMERIC(12,2) NOT NULL,
  sale_price NUMERIC(12,2),
  payload JSONB NOT NULL,
  pdf_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS html_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('terms','disclosure')),
  product_version TEXT,
  state_code TEXT,
  language TEXT NOT NULL DEFAULT 'en-US',
  version_tag TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_html_tmpl ON html_template(kind, product_version, state_code, language, version_tag);
CREATE INDEX IF NOT EXISTS idx_policy_number ON policy(policy_number);
CREATE INDEX IF NOT EXISTS idx_policy_state ON policy(state_code);
CREATE INDEX IF NOT EXISTS idx_policy_product ON policy(product_version);


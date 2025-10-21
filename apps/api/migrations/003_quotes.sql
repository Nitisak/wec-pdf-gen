-- Migration: Add quotes table
-- Date: 2025-10-20

CREATE TABLE IF NOT EXISTS quote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT UNIQUE NOT NULL,
  product_version TEXT NOT NULL,
  state_code TEXT NOT NULL,
  term_months INT NOT NULL DEFAULT 999,
  commercial BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Pricing
  base_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,
  
  -- Storage
  payload JSONB NOT NULL,  -- Full quote request
  pdf_key TEXT,            -- S3 key for generated PDF
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_number ON quote(quote_number);
CREATE INDEX IF NOT EXISTS idx_quote_state ON quote(state_code);
CREATE INDEX IF NOT EXISTS idx_quote_product ON quote(product_version);
CREATE INDEX IF NOT EXISTS idx_quote_valid_until ON quote(valid_until);
CREATE INDEX IF NOT EXISTS idx_quote_created ON quote(created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quote_updated_at ON quote;

CREATE TRIGGER update_quote_updated_at
  BEFORE UPDATE ON quote
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


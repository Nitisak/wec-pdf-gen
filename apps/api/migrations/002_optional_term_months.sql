-- Migration: Make termMonths optional with default value for Lifetime Warranty
-- Date: 2025-10-16

-- Drop the restrictive CHECK constraint that only allows 72, 84, 96
ALTER TABLE policy 
  DROP CONSTRAINT IF EXISTS policy_term_months_check;

-- Add a new CHECK constraint that allows any positive integer
ALTER TABLE policy 
  ADD CONSTRAINT policy_term_months_check CHECK (term_months > 0);

-- Add default value for term_months (999 represents lifetime warranty)
ALTER TABLE policy 
  ALTER COLUMN term_months SET DEFAULT 999;

-- Add default value for commercial (already has default, but ensuring consistency)
ALTER TABLE policy 
  ALTER COLUMN commercial SET DEFAULT false;

-- No need to alter existing data as they already have values


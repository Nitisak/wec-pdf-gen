-- Migration: Remove unique constraints from policy_number and quote_number
-- Date: 2025-10-21

-- Remove unique constraint from policy table
ALTER TABLE policy
  DROP CONSTRAINT IF EXISTS policy_policy_number_key;

-- Remove unique constraint from quote table  
ALTER TABLE quote
  DROP CONSTRAINT IF EXISTS quote_quote_number_key;

-- Note: The indexes will remain for performance, but duplicates are now allowed

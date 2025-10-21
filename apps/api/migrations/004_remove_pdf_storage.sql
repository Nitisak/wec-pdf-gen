-- Migration: Remove pdfKey column from quote table (no longer storing PDFs)
-- Date: 2025-10-20

-- Remove the pdfKey column since we're no longer storing PDFs in S3
ALTER TABLE quote DROP COLUMN IF EXISTS pdf_key;

-- Update the comment to reflect the change
COMMENT ON TABLE quote IS 'Quote metadata - PDFs generated on-demand, not stored';

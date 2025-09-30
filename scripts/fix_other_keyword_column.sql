-- Add the missing other_keyword column to rankings table
ALTER TABLE rankings ADD COLUMN IF NOT EXISTS other_keyword TEXT;

-- Update any existing rankings that might need the other_keyword field
UPDATE rankings SET other_keyword = '' WHERE other_keyword IS NULL;

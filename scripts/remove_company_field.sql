-- Remove company_name field from users table
ALTER TABLE users DROP COLUMN IF EXISTS company_name;

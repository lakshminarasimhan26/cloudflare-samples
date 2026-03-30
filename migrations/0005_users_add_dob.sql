-- Add dateOfBirth column to users table (nullable for existing rows)
ALTER TABLE users ADD COLUMN dateOfBirth TEXT;

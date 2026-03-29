-- Users table with audit timestamps.
-- `deletedAt` enables soft deletes for auditability.
CREATE TABLE IF NOT EXISTS users (
	id TEXT PRIMARY KEY,
	firstName TEXT NOT NULL,
	lastName TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL,
	deletedAt TEXT
);

-- Helpful for lookups and filtering out soft-deleted rows.
CREATE INDEX IF NOT EXISTS users_deletedAt_idx ON users(deletedAt);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);


-- Tracks every R2 JSON file that has been processed so we never
-- import the same file twice, even if it stays in the bucket.
CREATE TABLE IF NOT EXISTS r2_import_log (
	id          TEXT PRIMARY KEY,
	r2Key       TEXT NOT NULL UNIQUE,   -- e.g. "2024/01/users-batch-1.json"
	status      TEXT NOT NULL CHECK(status IN ('success', 'partial', 'failed')),
	usersFound  INTEGER NOT NULL DEFAULT 0,
	usersAdded  INTEGER NOT NULL DEFAULT 0,
	usersSkipped INTEGER NOT NULL DEFAULT 0,  -- duplicates / invalid rows
	errorMessage TEXT,
	importedAt  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS r2_import_log_r2Key_idx     ON r2_import_log(r2Key);
CREATE INDEX IF NOT EXISTS r2_import_log_importedAt_idx ON r2_import_log(importedAt DESC);

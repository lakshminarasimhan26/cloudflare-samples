-- Notifications table — many-to-one relationship with users.
-- Each notification belongs to exactly one user via userId (FK → users.id).
CREATE TABLE IF NOT EXISTS notifications (
	id        TEXT PRIMARY KEY,
	userId    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	type      TEXT NOT NULL CHECK(type IN ('info', 'warning', 'success', 'error')),
	title     TEXT NOT NULL,
	message   TEXT NOT NULL,
	isRead    INTEGER NOT NULL DEFAULT 0,  -- 0 = unread, 1 = read
	createdAt TEXT NOT NULL,
	readAt    TEXT                          -- NULL until marked as read
);

CREATE INDEX IF NOT EXISTS notifications_userId_idx  ON notifications(userId);
CREATE INDEX IF NOT EXISTS notifications_isRead_idx  ON notifications(isRead);
CREATE INDEX IF NOT EXISTS notifications_createdAt_idx ON notifications(createdAt DESC);

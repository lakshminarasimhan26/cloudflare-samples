-- Seed data for users and notifications.
-- Run after migrations: npx wrangler d1 execute <DB_NAME> --local --file=migrations/0003_seed.sql

-- ── Users ────────────────────────────────────────────────────
INSERT OR IGNORE INTO users (id, firstName, lastName, email, createdAt, updatedAt, deletedAt) VALUES
  ('u-001', 'Alice',   'Johnson', 'alice.johnson@example.com',  '2024-11-01T08:00:00Z', '2024-11-01T08:00:00Z', NULL),
  ('u-002', 'Bob',     'Smith',   'bob.smith@example.com',      '2024-11-05T09:30:00Z', '2024-11-05T09:30:00Z', NULL),
  ('u-003', 'Carol',   'White',   'carol.white@example.com',    '2024-11-10T11:00:00Z', '2024-11-10T11:00:00Z', NULL),
  ('u-004', 'David',   'Brown',   'david.brown@example.com',    '2024-12-01T14:00:00Z', '2024-12-01T14:00:00Z', NULL),
  ('u-005', 'Eva',     'Martinez','eva.martinez@example.com',   '2024-12-15T10:00:00Z', '2024-12-15T10:00:00Z', NULL);

-- ── Notifications ─────────────────────────────────────────────
INSERT OR IGNORE INTO notifications (id, userId, type, title, message, isRead, createdAt, readAt) VALUES
  -- Alice
  ('n-001', 'u-001', 'success', 'Welcome!',            'Your account has been created successfully.',         1, '2024-11-01T08:05:00Z', '2024-11-01T09:00:00Z'),
  ('n-002', 'u-001', 'info',    'Profile tip',         'Complete your profile to unlock all features.',       1, '2024-11-02T10:00:00Z', '2024-11-02T11:00:00Z'),
  ('n-003', 'u-001', 'warning', 'Password expiring',   'Your password will expire in 7 days. Please update.', 0, '2024-11-20T08:00:00Z', NULL),
  -- Bob
  ('n-004', 'u-002', 'success', 'Welcome!',            'Your account has been created successfully.',         1, '2024-11-05T09:35:00Z', '2024-11-05T10:00:00Z'),
  ('n-005', 'u-002', 'error',   'Login attempt',       'A failed login attempt was detected from a new IP.',  0, '2024-11-18T03:00:00Z', NULL),
  ('n-006', 'u-002', 'info',    'New feature',         'Check out the new notifications dashboard.',          0, '2024-12-01T09:00:00Z', NULL),
  -- Carol
  ('n-007', 'u-003', 'success', 'Welcome!',            'Your account has been created successfully.',         1, '2024-11-10T11:05:00Z', '2024-11-10T12:00:00Z'),
  ('n-008', 'u-003', 'info',    'Scheduled maintenance','System maintenance on Dec 1st from 2–4 AM UTC.',     0, '2024-11-25T12:00:00Z', NULL),
  -- David
  ('n-009', 'u-004', 'success', 'Welcome!',            'Your account has been created successfully.',         0, '2024-12-01T14:05:00Z', NULL),
  ('n-010', 'u-004', 'warning', 'Storage limit',       'You are using 90% of your allocated storage.',        0, '2024-12-10T08:00:00Z', NULL),
  ('n-011', 'u-004', 'error',   'Export failed',       'Your data export failed. Please try again.',          0, '2024-12-12T15:00:00Z', NULL),
  -- Eva
  ('n-012', 'u-005', 'success', 'Welcome!',            'Your account has been created successfully.',         1, '2024-12-15T10:05:00Z', '2024-12-15T10:30:00Z'),
  ('n-013', 'u-005', 'info',    'Report ready',        'Your monthly usage report for November is ready.',    1, '2024-12-16T08:00:00Z', '2024-12-16T09:00:00Z');

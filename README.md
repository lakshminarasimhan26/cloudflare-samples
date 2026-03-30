# Cloudflare Samples


## Local D1 Database Setup

### Apply migrations locally
```bash
npx wrangler d1 migrations apply my-first-worker --local
```

### Verify tables exist
```bash
npx wrangler d1 execute my-first-worker --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### Run a query manually
```bash
npx wrangler d1 execute my-first-worker --local --command "SELECT * FROM users;"
```

### Load seed data
```bash
npx wrangler d1 execute my-first-worker --local --file=migrations/0003_seed.sql
```

### Start local dev server
```bash
npm run dev
```

> Migrations are tracked automatically — only new files run on each apply.

---

## Testing the Users API with curl

### Create a new user
```bash
curl -X POST http://localhost:8787/users \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "john.doe@example.com", "dateOfBirth": "1990-01-15"}'
```

### Update an existing user
```bash
curl -X PUT http://localhost:8787/users/<USER_ID> \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Jane", "lastName": "Doe", "email": "jane.doe@example.com"}'
```

### Other available endpoints
```bash
# List all users
curl http://localhost:8787/users

# Get a single user
curl http://localhost:8787/users/<USER_ID>

# Delete a user
curl -X DELETE http://localhost:8787/users/<USER_ID>

# List all notifications
curl http://localhost:8787/notifications

# Get notifications for a specific user
curl http://localhost:8787/notifications/user/<USER_ID>

# Mark a notification as read
curl -X PATCH http://localhost:8787/notifications/<NOTIF_ID>/read

# Delete a notification
curl -X DELETE http://localhost:8787/notifications/<NOTIF_ID>
```

> Replace `<USER_ID>` / `<NOTIF_ID>` with IDs returned from the list responses.

---

## R2 Bucket — Hourly User Import

Users can be bulk-imported from JSON files uploaded to an R2 bucket.
The worker checks for new files every hour via a cron trigger and imports
any users not already in the database.

### One-time setup

```bash
# 1. Create the R2 bucket
npx wrangler r2 bucket create user-imports

# 2. Apply all migrations (includes import log table + dateOfBirth column)
npx wrangler d1 migrations apply my-first-worker --local

# 3. Regenerate TypeScript types so Env picks up USER_IMPORTS_BUCKET
npm run cf-typegen
```

### Upload a JSON file to the local R2 emulator

```bash
npx wrangler r2 object put user-imports/batch-001.json \
  --file=r2-samples/batch-001.json --local
```

### Trigger the import manually (without waiting for cron)

```bash
# Option A — UI button at http://localhost:8787/ui/import (click "Run Import Now")

# Option B — curl the cron test endpoint (requires --test-scheduled flag)
npx wrangler dev --test-scheduled
# then in a second terminal:
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

### JSON file format

Each file in the bucket must be a JSON array:

```json
[
  { "firstName": "Jane",  "lastName": "Doe", "email": "jane@example.com",  "dateOfBirth": "1990-05-14" },
  { "firstName": "Tom",   "lastName": "Lee", "email": "tom@example.com",   "dateOfBirth": "1985-11-02" }
]
```

| Field         | Required | Notes                          |
|---------------|----------|--------------------------------|
| `firstName`   | ✅       | Non-empty string               |
| `lastName`    | ✅       | Non-empty string               |
| `email`       | ✅       | Must be a valid email address  |
| `dateOfBirth` | ❌       | ISO date string `YYYY-MM-DD`   |

### Import rules

- Each file is processed **at most once** — the filename (R2 key) is recorded in `r2_import_log` after processing.
- Rows with duplicate emails or invalid fields are **skipped**, not failed.
- The cron runs on schedule `0 * * * *` (top of every hour).
- View the full import history at **http://localhost:8787/ui/import**.

### UI Pages

| URL | Description |
|-----|-------------|
| `/ui/users` | User directory (tile view) |
| `/ui/users/new` | Create a new user |
| `/ui/users/:id/edit` | Edit or delete a user |
| `/ui/users/:id/notifications` | Per-user notification feed |
| `/ui/notifications` | Global notifications dashboard |
| `/ui/import` | R2 import log and manual trigger |

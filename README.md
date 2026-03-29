# Cloudflare Samples


## Local D1 Database Setup

### Apply migrations locally
```bash
npx wrangler d1 migrations apply <DB_NAME> --local
npx wrangler d1 migrations apply my-first-worker --local

```

### Verify tables exist
```bash
npx wrangler d1 execute <DB_NAME> --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### Run a query manually
```bash
npx wrangler d1 execute <DB_NAME> --local --command "SELECT * FROM users;"
npx wrangler d1 execute my-first-worker --local --command "SELECT * FROM users;"
```

### Start local dev server
```bash
npm run dev
```

> Replace `<DB_NAME>` with the `database_name` value from `wrangler.jsonc`.
> Migrations are tracked automatically — only new files run on each apply.


## Testing the Users API with curl

### Create a new user
```bash
curl -X POST http://localhost:8787/users \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "john.doe@example.com"}'
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
```

> Replace `<USER_ID>` with the `id` returned from the create or list response.
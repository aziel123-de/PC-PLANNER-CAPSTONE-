Backend (Node + Express)

What’s included
- index.js — minimal Express server with register/login endpoints
- mysql.js — MySQL connection pool (reads .env)
- create_database.js — helper to create the `pcbuild` database if missing
- migrate_create_table.js — helper to create `users` table
- .env — database credentials and PORT
- package.json / node_modules — dependencies

Run locally
1. From the Backend folder, install deps (if node_modules missing):
   npm install
2. Ensure .env has your MySQL credentials (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME)
3. Create DB and tables (optional):
   node create_database.js
   node migrate_create_table.js
4. Start server:
   node index.js

Quick cleanup
- Remove node_modules (PowerShell):
  Remove-Item -Recurse -Force .\node_modules

Notes
- Server listens on 127.0.0.1 and default port 5050 (override with PORT in .env)
- Endpoints: POST /register, POST /api/register, POST /login, POST /api/login
- This README is intentionally small; ask if you want tests or CI hooks added.

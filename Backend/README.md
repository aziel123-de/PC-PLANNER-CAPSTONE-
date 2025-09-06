Backend (Node + Express)

Purpose
This backend provides minimal register/login endpoints and the DB migration script used by the PC Planner project.

Files of interest
- `index.js` — Express server (register/login)
- `mysql.js` — MySQL connection pool (reads `.env`)
- `migrate_create_table.js` — ensures the `users` table exists (run this after DB is created)
- `check_users_table.js` — utility to verify the `users` table and row count
- `.env.example` — example env file (copy to `.env` and customize)

Quick setup (new developer)
1. Install dependencies:
   npm install

2. Copy `.env.example` to `.env` and fill in real credentials (do not commit `.env`):
   cp .env.example .env

3. Ensure the physical database `pc_planner_db` exists. You can create it with MySQL Workbench, CLI or Docker. Example (CLI):
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS \`pc_planner_db\`;"

4. (Recommended) Create a dedicated DB user and grant privileges (run in Workbench or CLI):
   CREATE USER IF NOT EXISTS 'pcplanner'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'strongpass';
   GRANT ALL PRIVILEGES ON `pc_planner_db`.* TO 'pcplanner'@'127.0.0.1';
   FLUSH PRIVILEGES;

5. Set the same credentials in `.env` (DB_USER, DB_PASS) and run the migration to create the `users` table:
   npm run migrate

6. Verify the table exists:
   node check_users_table.js

7. Start the server (development):
   node index.js

Notes
- Keep `.env` out of source control. Use `.env.example` as the template.
- The backend reads these env keys: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `PORT`, `JWT_SECRET`.
- If you want a one-command local DB, consider adding a `docker-compose.yml` with a MySQL service.

Need help onboarding a teammate?
- I can add a `setup-dev.ps1` script to automate steps 2–5 for Windows developers.

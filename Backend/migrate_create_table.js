const fs = require('fs');
const path = require('path');
const pool = require('./mysql');

async function runMigrations() {
  const dir = path.join(__dirname, 'migrations');
  const exists = fs.existsSync(dir);
  if (!exists) {
    console.log('[migrate] No migrations directory found, creating users table fallback.');
    await ensureUsers();
    return;
  }
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  console.log('[migrate] Found SQL migrations:', files);
  const conn = await pool.getConnection();
  try {
    for (const file of files) {
      const full = path.join(dir, file);
      const sql = fs.readFileSync(full, 'utf8');
      console.log(`[migrate] Applying ${file}...`);
      // Split on ; but keep inside; basic approach (assumes no procedural delimiter changes)
      const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
      for (const stmt of statements) {
        try {
          await conn.query(stmt);
        } catch (err) {
          console.error(`[migrate] Error in ${file}:`, err.message);
          throw err;
        }
      }
      console.log(`[migrate] ${file} applied.`);
    }
  } finally {
    conn.release();
  }
}

async function ensureUsers() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255),
        salt VARCHAR(100) NOT NULL,
        hash VARCHAR(255) NOT NULL,
        createdAt DATETIME NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    console.log('[migrate] users table ensured');
  } finally { conn.release(); }
}

(async function(){
  try {
    await runMigrations();
    // ensure users table also (if not already via a migration file)
    await ensureUsers();
    console.log('[migrate] All migrations completed successfully.');
  } catch (e) {
    console.error('[migrate] migration error', e.message || e);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

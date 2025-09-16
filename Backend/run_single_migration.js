const fs = require('fs');
const path = require('path');
const pool = require('./mysql');

async function runFile(filename) {
  const full = path.join(__dirname, 'migrations', filename);
  if (!fs.existsSync(full)) {
    console.error('[run_single_migration] file not found:', full);
    process.exitCode = 1;
    return;
  }
  const sql = fs.readFileSync(full, 'utf8');
  const conn = await pool.getConnection();
  try {
    console.log('[run_single_migration] Applying', filename);
    const stmts = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const s of stmts) {
      try {
        await conn.query(s);
      } catch (err) {
        console.error('[run_single_migration] statement error:', err.message);
        throw err;
      }
    }
    console.log('[run_single_migration] Done');
  } finally { conn.release(); await pool.end(); }
}

const filename = process.argv[2] || '003_create_saved_builds.sql';
runFile(filename).catch(err => { console.error(err); process.exitCode = 1; });

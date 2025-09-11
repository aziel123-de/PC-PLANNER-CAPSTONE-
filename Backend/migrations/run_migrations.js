const fs = require('fs');
const path = require('path');
const pool = require('../mysql');

async function run() {
  const sqlPath = path.join(__dirname, '001_create_components_tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const conn = await pool.getConnection();
  try {
    console.log('Running migrations...');
    // split by semicolon and execute sequentially to avoid huge multi-statement issues
    const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      console.log('Executing:', stmt.split('\n')[0].slice(0, 80));
      await conn.query(stmt);
    }
    console.log('Migrations completed.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    conn.release();
    pool.end();
  }
}

run();

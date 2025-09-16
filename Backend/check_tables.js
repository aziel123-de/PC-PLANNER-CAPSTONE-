const pool = require('./mysql');

async function check() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('saved_builds','saved_build_items')
    `, [process.env.DB_NAME || 'pcbuild']);
    const found = rows.map(r => r.TABLE_NAME);
    console.log('Found tables:', found);
    if (!found.includes('saved_builds') || !found.includes('saved_build_items')) {
      console.error('One or both tables missing.');
      process.exitCode = 2;
    } else {
      console.log('Both tables exist.');
    }
  } finally { conn.release(); await pool.end(); }
}

check().catch(err => { console.error('check failed', err.message || err); process.exitCode = 1; });

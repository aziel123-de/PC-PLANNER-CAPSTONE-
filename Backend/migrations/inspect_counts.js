const pool = require('../mysql');

async function run() {
  const conn = await pool.getConnection();
  try {
    const tables = ['cpu','gpu','psu','mobo','ram','storage','m2','pc_case'];
    for (const t of tables) {
      const [rows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`${t}\``);
      console.log(`${t}: ${rows[0].cnt}`);
    }
  } catch (err) { console.error('error', err && err.message ? err.message : err); }
  finally { conn.release(); pool.end(); }
}

run();

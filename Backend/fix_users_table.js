const pool = require('./mysql');
require('dotenv').config();

(async function(){
  const db = process.env.DB_NAME || 'pcbuild';
  const conn = await pool.getConnection();
  try{
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
      [db]
    );
    const existing = new Set(cols.map(r => r.COLUMN_NAME));
    const desired = {
      id: `VARCHAR(36) PRIMARY KEY`,
      email: `VARCHAR(255) NOT NULL UNIQUE`,
      username: `VARCHAR(255)`,
      salt: `VARCHAR(100) NOT NULL`,
      hash: `VARCHAR(255) NOT NULL`,
      createdAt: `DATETIME NOT NULL`
    };

    for(const [col, def] of Object.entries(desired)){
      if(!existing.has(col)){
        console.log('Adding column', col);
        await conn.query(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
      }
    }

    console.log('fix complete');
  }catch(err){
    console.error('fix error', err && err.message ? err.message : err);
    process.exitCode = 2;
  } finally{
    conn.release();
    await pool.end();
  }
})();

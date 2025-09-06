const pool = require('./mysql');

(async function(){
  const conn = await pool.getConnection();
  try{
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255),
        salt VARCHAR(100) NOT NULL,
        hash VARCHAR(255) NOT NULL,
        createdAt DATETIME NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('users table ensured');
  }catch(e){
    console.error('migration error', e.message || e);
    process.exitCode = 1;
  } finally{
    conn.release();
    await pool.end();
  }
})();

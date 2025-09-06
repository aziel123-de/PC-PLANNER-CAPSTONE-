const pool = require('./mysql');
(async ()=>{
  const conn = await pool.getConnection();
  try{
    const [cols] = await conn.query("SELECT COLUMN_NAME,IS_NULLABLE,COLUMN_DEFAULT,DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='users'", [process.env.DB_NAME || 'pcbuild']);
    console.log(cols);
  }catch(err){
    console.error('err', err && err.message ? err.message : err);
  }finally{
    conn.release();
    await pool.end();
  }
})();

const pool = require('./mysql');
(async ()=>{
  const conn = await pool.getConnection();
  try{
    const extras = ['fullname','password','created_at'];
    for(const col of extras){
      const [rows] = await conn.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='users' AND COLUMN_NAME=?", [process.env.DB_NAME || 'pcbuild', col]);
      if(rows && rows.length){
        console.log('Dropping column', col);
        await conn.query(`ALTER TABLE users DROP COLUMN \`${col}\``);
      } else {
        console.log('Column not present:', col);
      }
    }
    console.log('drop complete');
  }catch(err){
    console.error('drop error', err && err.message ? err.message : err);
    process.exitCode = 2;
  }finally{
    conn.release();
    await pool.end();
  }
})();

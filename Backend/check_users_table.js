const pool = require('./mysql');
(async () => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SHOW TABLES LIKE 'users'");
    if (rows && rows.length) {
      console.log('users table exists');
      const [cnt] = await conn.query('SELECT COUNT(*) as c FROM users');
      console.log('users table rows:', cnt[0].c);
    } else {
      console.log('users table not found');
    }
  } catch (err) {
    console.error('db check error', err && err.message ? err.message : err);
    process.exit(2);
  } finally {
    conn.release();
  }
  process.exit(0);
})();

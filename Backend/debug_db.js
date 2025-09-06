const pool = require('./mysql');
(async () => {
  const conn = await pool.getConnection();
  try {
    console.log('connected, running test insert');
    const id = 'debug-' + Date.now();
    const email = 'debug+' + Date.now() + '@example.com';
    const username = 'debug';
    const salt = 's';
    const hash = 'h';
    const createdAt = new Date();
    const [res] = await conn.query('INSERT INTO users (id,email,username,salt,hash,createdAt) VALUES (?,?,?,?,?,?)', [id, email, username, salt, hash, createdAt]);
    console.log('insert result', res);
  } catch (err) {
    console.error('DEBUG DB ERROR full:', err);
    console.error('DEBUG DB ERROR message:', err && err.message);
    if (err && err.sql) console.error('SQL:', err.sql);
    process.exit(2);
  } finally {
    conn.release();
  }
  process.exit(0);
})();

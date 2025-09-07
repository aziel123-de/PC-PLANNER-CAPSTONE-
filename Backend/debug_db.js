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
// Archived: debug_db.js
// This file was archived to keep the Backend folder minimal.
// Use migrate_create_table.js and check_users_table.js for database setup and verification.

module.exports = {};

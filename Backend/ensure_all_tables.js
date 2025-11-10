// ensure_all_tables.js
// Manual one-off script to ensure all tables exist using table_queries.
// Usage: node ensure_all_tables.js

const pool = require('./mysql');
const { tableQueries } = require('./table_queries');

(async function(){
  const conn = await pool.getConnection();
  try {
    for (const [name, ddl] of Object.entries(tableQueries)) {
      try {
        await conn.query(ddl);
        console.log(`[ensure_all_tables] ensured: ${name}`);
      } catch (e) {
        console.error(`[ensure_all_tables] FAILED: ${name} ->`, e.message);
        throw e;
      }
    }
    console.log('[ensure_all_tables] complete');
  } catch (e) {
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
})();
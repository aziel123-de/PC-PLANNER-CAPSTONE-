const pool = require('./mysql');

async function checkCaseFans() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM case_fans');
    console.log('Case Fans count:', rows.length);
    console.log('Sample data:', rows[0]);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await conn.release();
  }
  process.exit(0);
}

checkCaseFans();
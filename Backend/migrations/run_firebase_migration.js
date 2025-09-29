const pool = require('../mysql');
const fs = require('fs');
const path = require('path');

async function runFirebaseMigration() {
  const conn = await pool.getConnection();
  try {
    const sql = fs.readFileSync(path.join(__dirname, '006_firebase_integration.sql'), 'utf8');
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      try {
        await conn.query(statement);
        console.log('Executed:', statement.trim());
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('Column already exists, skipping');
        } else {
          console.error('Error:', err.message);
        }
      }
    }
    console.log('Firebase migration completed');
  } finally {
    conn.release();
    pool.end();
  }
}

runFirebaseMigration();
// Add profile_picture column to users table
require('dotenv').config();
const pool = require('./mysql');

async function addProfilePictureColumn() {
  const conn = await pool.getConnection();
  try {
    // Check if column already exists
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_picture'
    `, [process.env.DB_NAME]);

    if (columns.length === 0) {
      // Add the column
      await conn.query(`
        ALTER TABLE users 
        ADD COLUMN profile_picture TEXT NULL
      `);
      console.log('✅ Added profile_picture column to users table');
    } else {
      console.log('✅ profile_picture column already exists');
    }
  } catch (err) {
    console.error('❌ Error adding profile_picture column:', err.message);
  } finally {
    conn.release();
  }
}

addProfilePictureColumn().then(() => {
  console.log('Migration completed');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
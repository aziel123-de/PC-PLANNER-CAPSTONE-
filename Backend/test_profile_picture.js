// Test script to verify profile picture functionality
require('dotenv').config();
const pool = require('./mysql');

async function testProfilePicture() {
  const conn = await pool.getConnection();
  try {
    // Check if profile_picture column exists
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_picture'
    `, [process.env.DB_NAME]);

    if (columns.length > 0) {
      console.log('✅ profile_picture column exists:', columns[0]);
      
      // Check if any users have profile pictures
      const [users] = await conn.query('SELECT id, email, username, profile_picture FROM users LIMIT 5');
      console.log('📋 Sample users:');
      users.forEach(user => {
        console.log(`  - ${user.email}: ${user.profile_picture || 'No profile picture'}`);
      });
    } else {
      console.log('❌ profile_picture column does not exist');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    conn.release();
  }
}

testProfilePicture().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
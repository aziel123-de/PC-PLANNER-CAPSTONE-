// Update profile_picture column to handle Base64 data
const pool = require('./mysql');

async function updateProfilePictureColumn() {
  const conn = await pool.getConnection();
  try {
    // Change profile_picture column to LONGTEXT to handle Base64 data
    await conn.query('ALTER TABLE users MODIFY COLUMN profile_picture LONGTEXT');
    console.log('Successfully updated profile_picture column to LONGTEXT');
  } catch (error) {
    console.error('Error updating profile_picture column:', error);
  } finally {
    conn.release();
  }
}

updateProfilePictureColumn().then(() => {
  console.log('Database update complete');
  process.exit(0);
}).catch(err => {
  console.error('Database update failed:', err);
  process.exit(1);
});
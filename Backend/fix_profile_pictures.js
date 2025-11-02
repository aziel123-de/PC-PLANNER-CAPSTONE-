// Fix profile_picture column to handle Base64 data
const pool = require('./mysql');

async function fixProfilePictureColumn() {
  const conn = await pool.getConnection();
  try {
    await conn.query('ALTER TABLE users MODIFY COLUMN profile_picture LONGTEXT');
    console.log('Successfully updated profile_picture column to LONGTEXT');
  } catch (error) {
    console.error('Error updating profile_picture column:', error);
  } finally {
    conn.release();
  }
}

fixProfilePictureColumn().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
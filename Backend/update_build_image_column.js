// Update build_image column to handle Base64 data
const pool = require('./mysql');

async function updateBuildImageColumn() {
  const conn = await pool.getConnection();
  try {
    // Change build_image column to LONGTEXT to handle Base64 data
    await conn.query('ALTER TABLE community_builds MODIFY COLUMN build_image LONGTEXT');
    console.log('Successfully updated build_image column to LONGTEXT');
  } catch (error) {
    console.error('Error updating build_image column:', error);
  } finally {
    conn.release();
  }
}

updateBuildImageColumn().then(() => {
  console.log('Database update complete');
  process.exit(0);
}).catch(err => {
  console.error('Database update failed:', err);
  process.exit(1);
});
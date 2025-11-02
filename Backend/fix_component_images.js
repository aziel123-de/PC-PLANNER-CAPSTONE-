// Fix component image columns to handle Base64 data
const pool = require('./mysql');

async function fixComponentImageColumns() {
  const conn = await pool.getConnection();
  try {
    const tables = ['cpu', 'cpu_cooler', 'gpu', 'psu', 'mobo', 'ram', 'storage', 'm2', 'pc_case', 'case_fans', 'keyboard', 'mouse', 'headset', 'monitor'];
    
    for (const table of tables) {
      try {
        // Check if table exists and has image column
        const [columns] = await conn.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'image'`);
        if (columns.length > 0) {
          console.log(`Updating image column in ${table} table...`);
          await conn.query(`ALTER TABLE \`${table}\` MODIFY COLUMN image LONGTEXT`);
          console.log(`✓ Updated ${table}.image to LONGTEXT`);
        } else {
          console.log(`- ${table} table doesn't have image column, skipping`);
        }
      } catch (error) {
        console.error(`Error updating ${table}:`, error.message);
      }
    }
    
    console.log('Component image columns update complete');
  } catch (error) {
    console.error('Error updating component image columns:', error);
  } finally {
    conn.release();
  }
}

fixComponentImageColumns().then(() => {
  console.log('Database update complete');
  process.exit(0);
}).catch(err => {
  console.error('Database update failed:', err);
  process.exit(1);
});
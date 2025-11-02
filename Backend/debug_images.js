// Debug image issues
const pool = require('./mysql');

async function debugImages() {
  const conn = await pool.getConnection();
  try {
    // Check what tables exist
    const [tables] = await conn.query("SHOW TABLES");
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Check cpu table structure
    const [cpuColumns] = await conn.query("SHOW COLUMNS FROM cpu");
    console.log('\nCPU table columns:', cpuColumns.map(c => c.Field));
    
    // Check if there are any Base64 strings in cpu table
    const [cpuRows] = await conn.query("SELECT * FROM cpu LIMIT 3");
    console.log('\nFirst 3 CPU rows:');
    cpuRows.forEach((row, i) => {
      console.log(`Row ${i + 1}:`, Object.keys(row).reduce((acc, key) => {
        const val = row[key];
        if (typeof val === 'string' && val.startsWith('data:')) {
          acc[key] = `[Base64 data: ${val.substring(0, 50)}...]`;
        } else {
          acc[key] = val;
        }
        return acc;
      }, {}));
    });
    
    // Check item_images table
    const [itemImages] = await conn.query("SELECT * FROM item_images LIMIT 5");
    console.log('\nItem images table (first 5):');
    itemImages.forEach((row, i) => {
      console.log(`Row ${i + 1}:`, {
        id: row.id,
        item_id: row.item_id,
        name: row.name,
        image_url: row.image_url?.startsWith('data:') ? `[Base64: ${row.image_url.substring(0, 50)}...]` : row.image_url,
        provider: row.provider
      });
    });
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    conn.release();
  }
}

debugImages().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Debug failed:', err);
  process.exit(1);
});